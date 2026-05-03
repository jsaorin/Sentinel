// TODO(geyser-migration): replace polling with Geyser/LaserStream gRPC
// subscription. Polling does not scale beyond a few hundred signers; gRPC
// push gives sub-second latency and constant cost. See plan file
// "Detector de Durable Nonce accounts apuntando a signers trackeados".
import type { ILogger } from "@sentinel/common/logger";
import {
	DOMAIN_TYPES,
	type INonceAccountScanner,
	type NonceAccountSnapshot,
} from "@sentinel/domain";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { inject, injectable } from "inversify";

interface HeliusApiConfig {
	apiKey: string;
}

// Solana Durable Nonce account layout (80 bytes):
//   [0..4]   versión
//   [4..8]   estado
//   [8..40]  authority pubkey   ← we filter on this
//   [40..72] frozen blockhash
//   [72..80] fee calculator
const NONCE_ACCOUNT_DATA_SIZE = 80;
const NONCE_AUTHORITY_OFFSET = 8;

@injectable()
export class NonceAccountScannerService implements INonceAccountScanner {
	private readonly connection: Connection;

	constructor(
		@inject(DOMAIN_TYPES.HeliusApiConfig)
		private config: HeliusApiConfig,
		@inject(DOMAIN_TYPES.Logger)
		private logger: ILogger,
	) {
		this.connection = new Connection(
			`https://mainnet.helius-rpc.com/?api-key=${this.config.apiKey}`,
			"confirmed",
		);
	}

	async scanForAuthority(authority: string): Promise<NonceAccountSnapshot[]> {
		let authorityKey: PublicKey;
		try {
			authorityKey = new PublicKey(authority);
		} catch {
			this.logger.warning("nonce:scan:invalid-authority", { authority });
			return [];
		}

		const accounts = await this.connection.getProgramAccounts(
			SystemProgram.programId,
			{
				commitment: "confirmed",
				filters: [
					{ dataSize: NONCE_ACCOUNT_DATA_SIZE },
					{
						memcmp: {
							offset: NONCE_AUTHORITY_OFFSET,
							bytes: authorityKey.toBase58(),
						},
					},
				],
			},
		);

		this.logger.info("nonce:scan:authority", {
			authority,
			found: accounts.length,
		});

		const snapshots: NonceAccountSnapshot[] = [];
		for (const acc of accounts) {
			const fundedBy = await this.resolveFunder(acc.pubkey);
			snapshots.push({
				address: acc.pubkey.toBase58(),
				authority: authorityKey.toBase58(),
				fundedBy,
			});
		}
		return snapshots;
	}

	private async resolveFunder(noncePubkey: PublicKey): Promise<string | null> {
		try {
			const sigs = await this.connection.getSignaturesForAddress(noncePubkey, {
				limit: 1000,
			});
			if (sigs.length === 0) return null;
			// The earliest signature is the creation tx (createAccount + initializeNonce).
			const earliest = sigs[sigs.length - 1];
			const tx = await this.connection.getTransaction(earliest.signature, {
				commitment: "confirmed",
				maxSupportedTransactionVersion: 0,
			});
			if (!tx) return null;
			// Funder = first signer of the creation tx (fee payer).
			const msg = tx.transaction.message as unknown as {
				staticAccountKeys?: PublicKey[];
				accountKeys?: PublicKey[];
			};
			const keys = msg.staticAccountKeys ?? msg.accountKeys ?? [];
			return keys[0]?.toBase58() ?? null;
		} catch (err) {
			this.logger.debug("nonce:scan:funder-resolve-failed", {
				noncePubkey: noncePubkey.toBase58(),
				error: err instanceof Error ? err.message : String(err),
			});
			return null;
		}
	}
}

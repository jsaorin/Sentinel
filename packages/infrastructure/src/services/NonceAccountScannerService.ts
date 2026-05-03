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
const PAGE_LIMIT = 1000;
const MAX_PAGES = 5; // safety net — for "normal" signers we expect 0-1 pages

interface GetProgramAccountsV2Item {
	pubkey: string;
	account: {
		data: [string, "base64"];
	};
}

interface GetProgramAccountsV2Result {
	items?: GetProgramAccountsV2Item[];
	pagination_key?: string | null;
	paginationKey?: string | null;
}

@injectable()
export class NonceAccountScannerService implements INonceAccountScanner {
	private readonly connection: Connection;
	private readonly rpcUrl: string;

	constructor(
		@inject(DOMAIN_TYPES.HeliusApiConfig)
		private config: HeliusApiConfig,
		@inject(DOMAIN_TYPES.Logger)
		private logger: ILogger,
	) {
		this.rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${this.config.apiKey}`;
		this.connection = new Connection(this.rpcUrl, "confirmed");
	}

	async scanForAuthority(authority: string): Promise<NonceAccountSnapshot[]> {
		let authorityKey: PublicKey;
		try {
			authorityKey = new PublicKey(authority);
		} catch {
			this.logger.warning("nonce:scan:invalid-authority", { authority });
			return [];
		}

		// Helius rejects classic getProgramAccounts on SystemProgram with
		// "Too many accounts requested" — we must use getProgramAccountsV2 with
		// pagination. The memcmp filter is still applied server-side so the
		// total payload stays small in practice.
		const found: string[] = [];
		let paginationKey: string | null | undefined;
		for (let page = 0; page < MAX_PAGES; page++) {
			const response = await this.callGetProgramAccountsV2({
				programId: SystemProgram.programId.toBase58(),
				dataSize: NONCE_ACCOUNT_DATA_SIZE,
				memcmpOffset: NONCE_AUTHORITY_OFFSET,
				memcmpBytes: authorityKey.toBase58(),
				limit: PAGE_LIMIT,
				paginationKey: paginationKey ?? undefined,
			});
			for (const item of response.items ?? []) {
				found.push(item.pubkey);
			}
			paginationKey = response.paginationKey ?? response.pagination_key;
			if (!paginationKey) break;
		}

		this.logger.info("nonce:scan:authority", {
			authority,
			found: found.length,
		});

		const snapshots: NonceAccountSnapshot[] = [];
		for (const pubkey of found) {
			const fundedBy = await this.resolveFunder(new PublicKey(pubkey));
			snapshots.push({
				address: pubkey,
				authority: authorityKey.toBase58(),
				fundedBy,
			});
		}
		return snapshots;
	}

	private async callGetProgramAccountsV2(args: {
		programId: string;
		dataSize: number;
		memcmpOffset: number;
		memcmpBytes: string;
		limit: number;
		paginationKey?: string;
	}): Promise<GetProgramAccountsV2Result> {
		const body = {
			jsonrpc: "2.0",
			id: 1,
			method: "getProgramAccountsV2",
			params: [
				args.programId,
				{
					encoding: "base64",
					commitment: "confirmed",
					filters: [
						{ dataSize: args.dataSize },
						{
							memcmp: {
								offset: args.memcmpOffset,
								bytes: args.memcmpBytes,
							},
						},
					],
					limit: args.limit,
					...(args.paginationKey ? { paginationKey: args.paginationKey } : {}),
				},
			],
		};
		const res = await fetch(this.rpcUrl, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
		});
		if (!res.ok) {
			throw new Error(
				`getProgramAccountsV2 HTTP ${res.status}: ${await res.text()}`,
			);
		}
		const json = (await res.json()) as {
			result?: GetProgramAccountsV2Result;
			error?: { message?: string };
		};
		if (json.error) {
			throw new Error(
				`getProgramAccountsV2 RPC error: ${json.error.message ?? "unknown"}`,
			);
		}
		return json.result ?? {};
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

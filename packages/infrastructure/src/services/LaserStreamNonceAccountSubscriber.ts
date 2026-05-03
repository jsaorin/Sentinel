import { createRequire } from "node:module";
import type { ILogger } from "@sentinel/common/logger";
import {
	DOMAIN_TYPES,
	type INonceAccountSubscriber,
	type NonceAccountMatchEvent,
	type NonceAccountMatchHandler,
} from "@sentinel/domain";
import { Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { inject, injectable } from "inversify";

const require = createRequire(import.meta.url);
const grpcMod = require("@triton-one/yellowstone-grpc");
type GrpcClient = {
	connect(): Promise<void>;
	subscribe(): Promise<{
		on(event: "data", cb: (data: unknown) => void): void;
		on(event: "error", cb: (err: unknown) => void): void;
		on(event: "end" | "close", cb: () => void): void;
		write(req: unknown, cb?: (err?: unknown) => void): void;
		destroy?(): void;
	}>;
};
const Client: new (
	endpoint: string,
	token: string,
	options?: Record<string, unknown>,
) => GrpcClient = grpcMod.default ?? grpcMod;

// Yellowstone proto enum: PROCESSED=0, CONFIRMED=1, FINALIZED=2
const COMMITMENT_CONFIRMED = 1;

// Solana Durable Nonce account layout (80 bytes):
//   [0..4]   versión
//   [4..8]   estado
//   [8..40]  authority pubkey   ← we filter on this
//   [40..72] frozen blockhash
//   [72..80] fee calculator
const NONCE_ACCOUNT_DATA_SIZE = 80;
const NONCE_AUTHORITY_OFFSET = 8;

const RECONNECT_BACKOFF_MS = [1_000, 2_000, 5_000, 10_000, 30_000];

interface LaserStreamConfig {
	endpoint: string;
	token: string;
	heliusApiKey: string; // for funder resolution via standard RPC
}

@injectable()
export class LaserStreamNonceAccountSubscriber
	implements INonceAccountSubscriber
{
	private readonly authorities = new Set<string>();
	private handler: NonceAccountMatchHandler | null = null;
	private client: GrpcClient | null = null;
	private stream: Awaited<ReturnType<GrpcClient["subscribe"]>> | null = null;
	private reconnectAttempt = 0;
	private stopped = false;
	private readonly fundReadConnection: Connection;

	constructor(
		@inject(DOMAIN_TYPES.LaserStreamConfig)
		private readonly config: LaserStreamConfig,
		@inject(DOMAIN_TYPES.Logger)
		private readonly logger: ILogger,
	) {
		this.fundReadConnection = new Connection(
			`https://mainnet.helius-rpc.com/?api-key=${this.config.heliusApiKey}`,
			"confirmed",
		);
	}

	async start(
		authorities: string[],
		handler: NonceAccountMatchHandler,
	): Promise<void> {
		this.handler = handler;
		this.stopped = false;
		this.authorities.clear();
		for (const a of authorities) {
			if (this.isValidPubkey(a)) this.authorities.add(a);
		}
		await this.connect();
		this.logger.info("nonce-subscriber:started", {
			endpoint: this.config.endpoint,
			authorityCount: this.authorities.size,
		});
	}

	async addAuthority(authority: string): Promise<void> {
		if (!this.isValidPubkey(authority)) {
			this.logger.warning("nonce-subscriber:invalid-authority", { authority });
			return;
		}
		const before = this.authorities.size;
		this.authorities.add(authority);
		if (this.authorities.size === before) return; // no change
		this.logger.info("nonce-subscriber:authority-added", {
			authority,
			total: this.authorities.size,
		});
		if (this.stream) await this.refreshSubscription();
	}

	async removeAuthority(authority: string): Promise<void> {
		const had = this.authorities.delete(authority);
		if (!had) return;
		this.logger.info("nonce-subscriber:authority-removed", {
			authority,
			total: this.authorities.size,
		});
		if (this.stream) await this.refreshSubscription();
	}

	getAuthorities(): string[] {
		return [...this.authorities];
	}

	async stop(): Promise<void> {
		this.stopped = true;
		const stream = this.stream;
		this.stream = null;
		if (stream && typeof stream.destroy === "function") {
			try {
				stream.destroy();
			} catch {
				// best-effort
			}
		}
		this.logger.info("nonce-subscriber:stopped");
	}

	private async connect(): Promise<void> {
		try {
			this.client = new Client(this.config.endpoint, this.config.token, {
				"grpc.max_receive_message_length": 64 * 1024 * 1024,
			});
			await this.client.connect();
			this.stream = await this.client.subscribe();
			this.attachStreamHandlers();
			await this.refreshSubscription();
			this.reconnectAttempt = 0;
			this.logger.info("nonce-subscriber:connected", {
				endpoint: this.config.endpoint,
			});
		} catch (err) {
			this.logger.error("nonce-subscriber:connect-failed", {
				err: (err as Error).message,
			});
			await this.scheduleReconnect();
		}
	}

	private attachStreamHandlers(): void {
		if (!this.stream) return;
		this.stream.on("data", (raw: unknown) => {
			void this.handleData(raw);
		});
		this.stream.on("error", (err: unknown) => {
			this.logger.error("nonce-subscriber:stream-error", {
				err: (err as Error)?.message ?? String(err),
			});
			void this.scheduleReconnect();
		});
		this.stream.on("end", () => {
			this.logger.warning("nonce-subscriber:stream-ended");
			void this.scheduleReconnect();
		});
		this.stream.on("close", () => {
			this.logger.warning("nonce-subscriber:stream-closed");
		});
	}

	private async refreshSubscription(): Promise<void> {
		if (!this.stream) return;
		const accounts: Record<string, unknown> = {};
		// Yellowstone combines filter groups with OR. One group per authority,
		// each constrained to dataSize=80 + memcmp at offset 8.
		for (const authority of this.authorities) {
			accounts[`auth_${authority.slice(0, 8)}_${authority.slice(-4)}`] = {
				account: [],
				owner: [],
				filters: [
					{ datasize: String(NONCE_ACCOUNT_DATA_SIZE) },
					{
						memcmp: {
							offset: String(NONCE_AUTHORITY_OFFSET),
							base58: authority,
						},
					},
				],
				nonemptyTxnSignature: undefined,
			};
		}
		const req = {
			accounts,
			slots: {},
			transactions: {},
			transactionsStatus: {},
			blocks: {},
			blocksMeta: {},
			entry: {},
			commitment: COMMITMENT_CONFIRMED,
			accountsDataSlice: [],
		};
		await new Promise<void>((resolve, reject) => {
			if (!this.stream) {
				resolve();
				return;
			}
			this.stream.write(req, (err?: unknown) =>
				err ? reject(err) : resolve(),
			);
		});
	}

	private async scheduleReconnect(): Promise<void> {
		if (this.stopped) return;
		const delayMs =
			RECONNECT_BACKOFF_MS[
				Math.min(this.reconnectAttempt, RECONNECT_BACKOFF_MS.length - 1)
			];
		this.reconnectAttempt += 1;
		this.logger.warning("nonce-subscriber:reconnect-scheduled", {
			attempt: this.reconnectAttempt,
			delayMs,
		});
		this.stream = null;
		this.client = null;
		await new Promise((r) => setTimeout(r, delayMs));
		if (this.stopped) return;
		await this.connect();
	}

	private async handleData(raw: unknown): Promise<void> {
		const data = raw as {
			account?: {
				account?: {
					pubkey?: Buffer;
					data?: Buffer;
					lamports?: string;
				};
				slot?: string;
			};
		};
		if (!data.account?.account?.pubkey || !data.account.account.data) return;
		if (!this.handler) return;

		try {
			const accountData = data.account.account.data;
			if (accountData.length !== NONCE_ACCOUNT_DATA_SIZE) return;
			const authorityBytes = accountData.subarray(
				NONCE_AUTHORITY_OFFSET,
				NONCE_AUTHORITY_OFFSET + 32,
			);
			const authority = bs58.encode(authorityBytes);
			if (!this.authorities.has(authority)) {
				// Defensive: server-side filter should have already excluded this.
				return;
			}
			const address = bs58.encode(data.account.account.pubkey);
			const slot = Number(data.account.slot ?? 0);
			const fundedBy = await this.resolveFunder(address);
			const event: NonceAccountMatchEvent = {
				address,
				authority,
				fundedBy,
				slot,
			};
			await this.handler(event);
		} catch (err) {
			this.logger.error("nonce-subscriber:handle-data-failed", {
				err: (err as Error).message,
			});
		}
	}

	private async resolveFunder(noncePubkey: string): Promise<string | null> {
		try {
			const sigs = await this.fundReadConnection.getSignaturesForAddress(
				new PublicKey(noncePubkey),
				{ limit: 1000 },
			);
			if (sigs.length === 0) return null;
			const earliest = sigs[sigs.length - 1];
			const tx = await this.fundReadConnection.getTransaction(
				earliest.signature,
				{
					commitment: "confirmed",
					maxSupportedTransactionVersion: 0,
				},
			);
			if (!tx) return null;
			const msg = tx.transaction.message as unknown as {
				staticAccountKeys?: PublicKey[];
				accountKeys?: PublicKey[];
			};
			const keys = msg.staticAccountKeys ?? msg.accountKeys ?? [];
			return keys[0]?.toBase58() ?? null;
		} catch {
			return null;
		}
	}

	private isValidPubkey(s: string): boolean {
		try {
			new PublicKey(s);
			return true;
		} catch {
			return false;
		}
	}
}

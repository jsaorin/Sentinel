import { createHash } from "node:crypto";
import { inflateSync } from "node:zlib";
import type { ILogger } from "@sentinel/common/logger";
import {
	DOMAIN_TYPES,
	type IIdlResolverService,
	type IProgramRepository,
	type ResolvedIdl,
} from "@sentinel/domain";
import { Connection, PublicKey } from "@solana/web3.js";
import { inject, injectable } from "inversify";

interface HeliusApiConfig {
	apiKey: string;
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isFresh(fetchedAt: Date | null | undefined): boolean {
	if (!fetchedAt) return false;
	return Date.now() - fetchedAt.getTime() < CACHE_TTL_MS;
}

@injectable()
export class OnChainIdlResolverService implements IIdlResolverService {
	private readonly connection: Connection;

	constructor(
		@inject(DOMAIN_TYPES.HeliusApiConfig)
		private config: HeliusApiConfig,
		@inject(DOMAIN_TYPES.ProgramRepository)
		private programRepo: IProgramRepository,
		@inject(DOMAIN_TYPES.Logger)
		private logger: ILogger,
	) {
		this.connection = new Connection(
			`https://mainnet.helius-rpc.com/?api-key=${this.config.apiKey}`,
		);
	}

	async resolve(programId: string): Promise<ResolvedIdl | null> {
		const cached = await this.programRepo.findByProgramId(programId);
		if (cached && isFresh(cached.idlFetchedAt)) {
			if (cached.idlSource === "on-chain" && cached.idlJson) {
				return {
					programId,
					name: cached.name ?? "",
					version: cached.idlVersion ?? "",
					raw: cached.idlJson,
				};
			}
			if (cached.idlSource === "none") {
				return null;
			}
		}

		try {
			const pda = this.deriveIdlPda(programId);
			const acc = await this.connection.getAccountInfo(pda);
			if (!acc) {
				await this.programRepo.upsert({
					programId,
					idlSource: "none",
					idlFetchedAt: new Date(),
				});
				return null;
			}

			const idl = this.decodeIdlAccount(acc.data);
			const idlJsonStr = JSON.stringify(idl);
			const checksum = createHash("sha256").update(idlJsonStr).digest("hex");

			if (cached?.idlChecksum && cached.idlChecksum !== checksum) {
				this.logger.info(
					"IDL changed, invalidating cached decoded instructions",
					{
						programId,
					},
				);
				await this.programRepo.invalidate(programId);
			}

			await this.programRepo.upsert({
				programId,
				name: idl.name ?? null,
				idlJson: idl,
				idlVersion: idl.version ?? null,
				idlSource: "on-chain",
				idlChecksum: checksum,
				idlFetchedAt: new Date(),
			});

			return {
				programId,
				name: idl.name ?? "",
				version: idl.version ?? "",
				raw: idl,
			};
		} catch (e) {
			this.logger.warning("IDL resolve failed", {
				programId,
				error: e instanceof Error ? e.message : String(e),
			});
			return null;
		}
	}

	private deriveIdlPda(programId: string): PublicKey {
		const pk = new PublicKey(programId);
		const [base] = PublicKey.findProgramAddressSync([], pk);
		// `createWithSeed` is async in @solana/web3.js.
		return this.createWithSeedSync(base, "anchor:idl", pk);
	}

	/**
	 * Synchronous sha256-based derivation used by `PublicKey.createWithSeed`.
	 * Inlined to avoid async overhead on every resolve.
	 */
	private createWithSeedSync(
		base: PublicKey,
		seed: string,
		owner: PublicKey,
	): PublicKey {
		const buf = Buffer.concat([
			base.toBuffer(),
			Buffer.from(seed, "utf8"),
			owner.toBuffer(),
		]);
		const hash = createHash("sha256").update(buf).digest();
		return new PublicKey(hash);
	}

	private decodeIdlAccount(data: Buffer): {
		name?: string;
		version?: string;
		instructions: unknown[];
	} {
		// Anchor IDL account layout:
		//   [0..8]    account discriminator
		//   [8..40]   authority pubkey
		//   [40..44]  compressed length (u32 LE)
		//   [44..]    zlib-compressed JSON of the IDL
		const len = data.readUInt32LE(40);
		const compressed = data.subarray(44, 44 + len);
		const json = inflateSync(compressed).toString("utf8");
		return JSON.parse(json);
	}
}

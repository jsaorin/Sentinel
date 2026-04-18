import { request as httpsRequest } from "node:https";
import type { ILogger } from "@sentinel/common/logger";
import {
	DOMAIN_TYPES,
	type ISquadsHistoryService,
	type ProposalAccountData,
	type ReconstructedProposalsResult,
	type VaultTransactionData,
} from "@sentinel/domain";
import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import * as multisig from "@sqds/multisig";
import { inject, injectable } from "inversify";
import {
	classifySquadsInstruction,
	decodeVaultTransactionCreate,
	SQUADS_V4_PROGRAM_ID,
	type SquadsInstructionKind,
} from "./squads/SquadsTransactionParser.js";

interface HeliusApiConfig {
	apiKey: string;
}

const SIGNATURE_LIMIT = 50;
const CONCURRENCY = 5;

type ReconstructedIndex = {
	proposal: ProposalAccountData;
	vaultTransaction: VaultTransactionData | null;
};

interface RawTx {
	tx: VersionedTransaction;
	blockTime: number | null;
	err: boolean;
}

@injectable()
export class SquadsHistoryService implements ISquadsHistoryService {
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

	async reconstructClosedProposals(
		multisigAddress: string,
		closedIndices: number[],
	): Promise<ReconstructedProposalsResult> {
		if (closedIndices.length === 0) {
			return { proposals: [], vaultTransactions: [] };
		}

		this.logger.info("[history] reconstructing closed proposals", {
			multisigAddress,
			count: closedIndices.length,
		});

		const multisigPda = new PublicKey(multisigAddress);
		const reconstructed = await pMap(
			closedIndices,
			CONCURRENCY,
			async (index) => {
				try {
					return await this.reconstructIndex(multisigPda, index);
				} catch (err) {
					this.logger.debug("[history] reconstruction failed", {
						multisigAddress,
						index,
						error: err instanceof Error ? err.message : String(err),
					});
					return null;
				}
			},
		);

		const proposals: ProposalAccountData[] = [];
		const vaultTransactions: VaultTransactionData[] = [];
		for (const entry of reconstructed) {
			if (!entry) continue;
			proposals.push(entry.proposal);
			if (entry.vaultTransaction) {
				vaultTransactions.push(entry.vaultTransaction);
			}
		}

		this.logger.info("[history] reconstruction done", {
			multisigAddress,
			requested: closedIndices.length,
			recovered: proposals.length,
		});

		return { proposals, vaultTransactions };
	}

	private async reconstructIndex(
		multisigPda: PublicKey,
		index: number,
	): Promise<ReconstructedIndex | null> {
		const [proposalPda] = multisig.getProposalPda({
			multisigPda,
			transactionIndex: BigInt(index),
		});
		const [txPda] = multisig.getTransactionPda({
			multisigPda,
			index: BigInt(index),
		});

		const sigs = await this.connection.getSignaturesForAddress(proposalPda, {
			limit: SIGNATURE_LIMIT,
		});
		if (sigs.length === 0) return null;

		const ordered = [...sigs].reverse();

		let creator: string | null = null;
		let createdAt: Date | null = null;
		let terminalStatus: "EXECUTED" | "CANCELLED" | "REJECTED" | null = null;
		let executedAt: Date | null = null;
		let fallbackCreatedAt: Date | null = null;
		let innerInstructions: VaultTransactionData | null = null;

		for (const sig of ordered) {
			const raw = await this.fetchTransaction(sig.signature);
			if (!raw || raw.err) continue;

			const blockTime = raw.blockTime
				? new Date(raw.blockTime * 1000)
				: new Date();
			if (!fallbackCreatedAt) fallbackCreatedAt = blockTime;

			const message = raw.tx.message;
			const staticKeys = message.staticAccountKeys;

			for (const ix of message.compiledInstructions) {
				const programId = staticKeys[ix.programIdIndex];
				if (!programId) continue;
				if (programId.toBase58() !== SQUADS_V4_PROGRAM_ID) continue;

				const data = Buffer.from(ix.data);
				const kind: SquadsInstructionKind = classifySquadsInstruction(data);

				switch (kind) {
					case "proposalCreate": {
						// Account layout: [multisig, proposal, creator, rentPayer?, systemProgram]
						const creatorIdx = ix.accountKeyIndexes[2];
						if (
							creatorIdx !== undefined &&
							creatorIdx < staticKeys.length &&
							!creator
						) {
							creator = staticKeys[creatorIdx].toBase58();
						}
						if (!createdAt) createdAt = blockTime;
						break;
					}
					case "vaultTransactionCreate": {
						const decoded = decodeVaultTransactionCreate(data);
						if (decoded) {
							innerInstructions = await this.buildVaultTransactionData(
								txPda,
								decoded,
							);
						}
						if (!creator) {
							const creatorIdx = ix.accountKeyIndexes[2];
							if (creatorIdx !== undefined && creatorIdx < staticKeys.length) {
								creator = staticKeys[creatorIdx].toBase58();
							}
						}
						if (!createdAt) createdAt = blockTime;
						break;
					}
					case "proposalReject":
						terminalStatus = "REJECTED";
						break;
					case "proposalCancel":
						terminalStatus = "CANCELLED";
						break;
					case "vaultTransactionExecute":
					case "configTransactionExecute":
					case "batchExecuteTransaction":
						terminalStatus = "EXECUTED";
						executedAt = blockTime;
						break;
					default:
						break;
				}
			}
		}

		const status: ProposalAccountData["status"] = terminalStatus ?? "EXECUTED";
		const resolvedCreatedAt = createdAt ?? fallbackCreatedAt ?? new Date();

		const proposal: ProposalAccountData = {
			proposalIndex: index,
			transactionIndex: index,
			pda: proposalPda.toBase58(),
			transactionPda: txPda.toBase58(),
			status,
			creator,
			createdAt: resolvedCreatedAt,
			executedAt: status === "EXECUTED" ? executedAt : null,
		};

		return { proposal, vaultTransaction: innerInstructions };
	}

	// Resolve ALT lookups and build VaultTransactionData with real programIds
	// and account addresses. The decoded message's accountKeys is just the
	// static portion; inner instructions reference indexes that span into the
	// ALT-loaded addresses (writable first, then readonly), following the same
	// convention as Solana v0 messages.
	private async buildVaultTransactionData(
		txPda: PublicKey,
		decoded: ReturnType<typeof decodeVaultTransactionCreate> & object,
	): Promise<VaultTransactionData> {
		const allAccountKeys: PublicKey[] = [...decoded.accountKeys];
		for (const lookup of decoded.addressTableLookups) {
			const alt = await this.connection.getAddressLookupTable(
				lookup.accountKey,
			);
			if (!alt.value) continue;
			const addresses = alt.value.state.addresses;
			for (const idx of lookup.writableIndexes) {
				if (idx < addresses.length) allAccountKeys.push(addresses[idx]);
			}
			for (const idx of lookup.readonlyIndexes) {
				if (idx < addresses.length) allAccountKeys.push(addresses[idx]);
			}
		}

		return {
			transactionPda: txPda.toBase58(),
			instructions: decoded.instructions.map((ix, i) => ({
				instructionIndex: i,
				programId:
					ix.programIdIndex < allAccountKeys.length
						? allAccountKeys[ix.programIdIndex].toBase58()
						: `unknown(${ix.programIdIndex})`,
				data: ix.data,
				accounts: ix.accountIndexes.map((idx) =>
					idx < allAccountKeys.length
						? allAccountKeys[idx].toBase58()
						: `unknown(${idx})`,
				),
			})),
		};
	}

	// Raw node:https POST (NOT connection.getTransaction or fetch). Using the
	// web3.js Connection or native fetch against Helius for these transactions
	// OOMs V8 during TLS stream handling — the legacy https module with
	// preallocated buffer + "accept-encoding: identity" is the only stable path.
	private fetchTransaction(signature: string): Promise<RawTx | null> {
		const body = JSON.stringify({
			jsonrpc: "2.0",
			id: 1,
			method: "getTransaction",
			params: [
				signature,
				{
					encoding: "base64",
					maxSupportedTransactionVersion: 0,
					commitment: "confirmed",
				},
			],
		});

		return new Promise<RawTx | null>((resolve, reject) => {
			const url = new URL(this.rpcUrl);
			const req = httpsRequest(
				{
					hostname: url.hostname,
					port: url.port || 443,
					path: `${url.pathname}${url.search}`,
					method: "POST",
					headers: {
						"content-type": "application/json",
						"content-length": Buffer.byteLength(body),
						"accept-encoding": "identity",
						"user-agent": "sentinel-history/1.0",
						accept: "application/json",
					},
				},
				(res) => {
					const expected = Number(res.headers["content-length"]) || 0;
					const buf = expected > 0 ? Buffer.allocUnsafe(expected) : null;
					const chunks: Buffer[] = [];
					let offset = 0;
					res.on("data", (chunk: Buffer) => {
						if (buf && offset + chunk.length <= expected) {
							chunk.copy(buf, offset);
							offset += chunk.length;
						} else {
							chunks.push(chunk);
						}
					});
					res.on("end", () => {
						try {
							const body = buf
								? offset === expected
									? buf
									: buf.subarray(0, offset)
								: Buffer.concat(chunks);
							const json = JSON.parse(body.toString("utf8")) as {
								result?: {
									transaction: [string, string];
									meta: { err: unknown } | null;
									blockTime: number | null;
								};
							};
							if (!json.result) return resolve(null);
							const [txBase64] = json.result.transaction;
							const tx = VersionedTransaction.deserialize(
								Buffer.from(txBase64, "base64"),
							);
							resolve({
								tx,
								blockTime: json.result.blockTime,
								err: Boolean(json.result.meta?.err),
							});
						} catch (err) {
							reject(err);
						}
					});
					res.on("error", reject);
				},
			);
			req.on("error", reject);
			req.write(body);
			req.end();
		});
	}
}

async function pMap<T, R>(
	items: T[],
	concurrency: number,
	fn: (item: T) => Promise<R>,
): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let cursor = 0;
	const workers = Array.from(
		{ length: Math.min(concurrency, items.length) },
		async () => {
			while (cursor < items.length) {
				const idx = cursor++;
				results[idx] = await fn(items[idx]);
			}
		},
	);
	await Promise.all(workers);
	return results;
}

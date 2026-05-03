import type { ILogger } from "@sentinel/common/logger";
import {
	DOMAIN_TYPES,
	type ISquadsHistoryService,
	type ISquadsService,
	type MultisigAccountData,
	type ProposalAccountData,
	type VaultTransactionData,
} from "@sentinel/domain";
import { Connection, PublicKey } from "@solana/web3.js";
import * as multisig from "@sqds/multisig";
import { inject, injectable } from "inversify";
import { InstructionDecoder } from "./InstructionDecoder.js";

interface HeliusApiConfig {
	apiKey: string;
}

@injectable()
export class SquadsService implements ISquadsService {
	private readonly connection: Connection;
	private reconstructedVaultTransactions: Map<string, VaultTransactionData> =
		new Map();

	constructor(
		@inject(DOMAIN_TYPES.HeliusApiConfig)
		private config: HeliusApiConfig,
		@inject(DOMAIN_TYPES.Logger)
		private logger: ILogger,
		@inject(DOMAIN_TYPES.SquadsHistoryService)
		private historyService: ISquadsHistoryService,
	) {
		this.connection = new Connection(
			`https://mainnet.helius-rpc.com/?api-key=${this.config.apiKey}`,
		);
	}

	async getMultisigAccountData(address: string): Promise<MultisigAccountData> {
		const multisigPda = new PublicKey(address);

		const multisigAccount = await multisig.accounts.Multisig.fromAccountAddress(
			this.connection,
			multisigPda,
		);

		const transactionIndex =
			typeof multisigAccount.transactionIndex === "number"
				? multisigAccount.transactionIndex
				: Number(multisigAccount.transactionIndex);

		const configAuthority =
			multisigAccount.configAuthority.toBase58() ===
			PublicKey.default.toBase58()
				? null
				: multisigAccount.configAuthority.toBase58();

		const [vaultPda] = multisig.getVaultPda({
			multisigPda,
			index: 0,
		});

		return {
			threshold: multisigAccount.threshold,
			members: multisigAccount.members.map((member) => ({
				address: member.key.toBase58(),
				permissions: { mask: member.permissions.mask },
			})),
			configAuthority,
			transactionIndex,
			vaultPda: vaultPda.toBase58(),
		};
	}

	async getProposals(
		multisigAddress: string,
		transactionIndex: number,
		startIndex = 1,
	): Promise<ProposalAccountData[]> {
		const multisigPda = new PublicKey(multisigAddress);
		const proposals: ProposalAccountData[] = [];
		const closedIndices: number[] = [];

		// Derive all proposal PDAs upfront
		const pdaEntries: Array<{ index: number; pda: PublicKey }> = [];
		for (let i = startIndex; i <= transactionIndex; i++) {
			const [proposalPda] = multisig.getProposalPda({
				multisigPda,
				transactionIndex: BigInt(i),
			});
			pdaEntries.push({ index: i, pda: proposalPda });
		}

		if (pdaEntries.length === 0) {
			return proposals;
		}

		// Batch fetch accounts using getMultipleAccounts (max 100 per call)
		// Delay between batches to respect Helius rate limits
		const BATCH_SIZE = 100;
		const BATCH_DELAY_MS = 250;
		const totalBatches = Math.ceil(pdaEntries.length / BATCH_SIZE);

		this.logger.info("Fetching proposals in batches", {
			multisigAddress,
			totalIndices: pdaEntries.length,
			totalBatches,
		});

		for (let batch = 0; batch < pdaEntries.length; batch += BATCH_SIZE) {
			const chunk = pdaEntries.slice(batch, batch + BATCH_SIZE);
			const keys = chunk.map((e) => e.pda);

			if (batch > 0) {
				await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
			}

			const accountInfos = await this.connection.getMultipleAccountsInfo(keys);

			for (let j = 0; j < chunk.length; j++) {
				const accountInfo = accountInfos[j];
				if (!accountInfo) {
					// PDA closed (rent reclaimed after execution) or never created.
					// Defer to history reconstruction at the end of the batch sweep.
					closedIndices.push(chunk[j].index);
					continue;
				}

				try {
					const [proposalAccount] =
						multisig.accounts.Proposal.fromAccountInfo(accountInfo);

					const txIndex =
						typeof proposalAccount.transactionIndex === "number"
							? proposalAccount.transactionIndex
							: Number(proposalAccount.transactionIndex);

					// Creator: first approver (in Squads, the proposer auto-approves)
					const creator =
						proposalAccount.approved.length > 0
							? proposalAccount.approved[0].toBase58()
							: null;

					// Timestamps from status
					const statusData = proposalAccount.status;
					const statusTimestamp =
						"timestamp" in statusData
							? new Date(Number(statusData.timestamp) * 1000)
							: new Date();

					const executedAt =
						statusData.__kind === "Executed" ? statusTimestamp : null;

					// For createdAt, use the status timestamp as best approximation
					const createdAt = statusTimestamp;

					const [txPda] = multisig.getTransactionPda({
						multisigPda,
						index: BigInt(chunk[j].index),
					});

					proposals.push({
						proposalIndex: chunk[j].index,
						transactionIndex: txIndex,
						pda: chunk[j].pda.toBase58(),
						transactionPda: txPda.toBase58(),
						status: statusData.__kind.toUpperCase(),
						creator,
						createdAt,
						executedAt,
						approvers: proposalAccount.approved.map((p) => p.toBase58()),
						rejecters: proposalAccount.rejected.map((p) => p.toBase58()),
						cancellers: proposalAccount.cancelled.map((p) => p.toBase58()),
					});
				} catch (_error) {
					this.logger.debug("Failed to deserialize proposal, skipping", {
						multisigAddress,
						index: chunk[j].index,
					});
				}
			}
		}

		if (closedIndices.length > 0) {
			const reconstructed =
				await this.historyService.reconstructClosedProposals(
					multisigAddress,
					closedIndices,
				);
			proposals.push(...reconstructed.proposals);
			for (const vtx of reconstructed.vaultTransactions) {
				this.reconstructedVaultTransactions.set(vtx.transactionPda, vtx);
			}
		}

		proposals.sort((a, b) => a.proposalIndex - b.proposalIndex);
		return proposals;
	}

	async getVaultTransactionInstructions(
		transactionPdas: string[],
	): Promise<VaultTransactionData[]> {
		if (transactionPdas.length === 0) {
			return [];
		}

		const results: VaultTransactionData[] = [];
		const BATCH_SIZE = 100;
		const BATCH_DELAY_MS = 250;

		this.logger.info("Fetching vault transactions in batches", {
			total: transactionPdas.length,
			totalBatches: Math.ceil(transactionPdas.length / BATCH_SIZE),
		});

		for (let batch = 0; batch < transactionPdas.length; batch += BATCH_SIZE) {
			const chunk = transactionPdas.slice(batch, batch + BATCH_SIZE);
			const keys = chunk.map((pda) => new PublicKey(pda));

			if (batch > 0) {
				await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
			}

			const accountInfos = await this.connection.getMultipleAccountsInfo(keys);

			for (let j = 0; j < chunk.length; j++) {
				const accountInfo = accountInfos[j];
				if (!accountInfo) {
					// VaultTransaction PDA closed — use reconstructed data if available.
					const reconstructed = this.reconstructedVaultTransactions.get(
						chunk[j],
					);
					if (reconstructed) {
						results.push(reconstructed);
					}
					continue;
				}

				try {
					const [vaultTx] =
						multisig.accounts.VaultTransaction.fromAccountInfo(accountInfo);

					// Resolve full account keys: static + ALT lookups
					const allAccountKeys = [...vaultTx.message.accountKeys];

					for (const lookup of vaultTx.message.addressTableLookups) {
						const altAccount = await this.connection.getAddressLookupTable(
							lookup.accountKey,
						);
						if (!altAccount.value) continue;

						const addresses = altAccount.value.state.addresses;
						for (const idx of lookup.writableIndexes) {
							allAccountKeys.push(addresses[idx]);
						}
						for (const idx of lookup.readonlyIndexes) {
							allAccountKeys.push(addresses[idx]);
						}
					}

					const decoded = InstructionDecoder.decode(
						allAccountKeys,
						vaultTx.message.instructions,
					);

					results.push({
						transactionPda: chunk[j],
						instructions: decoded,
					});
				} catch (_error) {
					this.logger.debug(
						"Failed to deserialize VaultTransaction, skipping",
						{ transactionPda: chunk[j] },
					);
				}
			}
		}

		return results;
	}
}

import type {
	ProposalAccountData,
	VaultTransactionData,
} from "./ISquadsService.js";

export interface ReconstructedProposalsResult {
	proposals: ProposalAccountData[];
	vaultTransactions: VaultTransactionData[];
}

export interface ISquadsHistoryService {
	reconstructClosedProposals(
		multisigAddress: string,
		closedIndices: number[],
	): Promise<ReconstructedProposalsResult>;
}

import type { Proposal, ProposalStatus } from "../entities/Proposal.js";

export type ProposalSortField = "createdAt" | "executedAt";

export interface FindAllProposalsPaginatedOptions {
	skip: number;
	take: number;
	sortBy: ProposalSortField;
	status?: ProposalStatus;
}

export interface CountAllProposalsOptions {
	status?: ProposalStatus;
}

export interface UpdateProposalData {
	status?: ProposalStatus;
	approvers?: string[];
	rejecters?: string[];
	cancellers?: string[];
	executedAt?: Date | null;
}

export interface IProposalRepository {
	findById(id: string): Promise<Proposal | null>;
	findByMultisigId(multisigId: string): Promise<Proposal[]>;
	findByMultisigIdPaginated(
		multisigId: string,
		options: { skip: number; take: number },
	): Promise<Proposal[]>;
	findByMultisigIdAndIndices(
		multisigId: string,
		indices: number[],
	): Promise<Proposal[]>;
	countByMultisigId(multisigId: string): Promise<number>;
	findAllPaginated(
		options: FindAllProposalsPaginatedOptions,
	): Promise<Proposal[]>;
	countAll(options: CountAllProposalsOptions): Promise<number>;
	findLatestByMultisigId(multisigId: string): Promise<Proposal | null>;
	createMany(
		proposals: Array<{
			multisigId: string;
			proposalIndex: number;
			transactionIndex: number;
			pda: string;
			transactionPda: string;
			status: ProposalStatus;
			creator: string | null;
			createdAt: Date;
			executedAt: Date | null;
			approvers?: string[];
			rejecters?: string[];
			cancellers?: string[];
		}>,
	): Promise<Proposal[]>;
	update(id: string, data: UpdateProposalData): Promise<Proposal>;
}

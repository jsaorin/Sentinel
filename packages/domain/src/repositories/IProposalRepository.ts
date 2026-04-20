import type { Proposal, ProposalStatus } from "../entities/Proposal.js";

export interface IProposalRepository {
	findById(id: string): Promise<Proposal | null>;
	findByMultisigId(multisigId: string): Promise<Proposal[]>;
	findByMultisigIdPaginated(
		multisigId: string,
		options: { skip: number; take: number },
	): Promise<Proposal[]>;
	countByMultisigId(multisigId: string): Promise<number>;
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
		}>,
	): Promise<Proposal[]>;
}

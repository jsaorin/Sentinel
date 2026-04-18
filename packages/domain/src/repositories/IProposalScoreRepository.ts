import type { ProposalFlag, ProposalScore } from "../entities/ProposalScore.js";

export interface UpsertProposalScoreInput {
	proposalId: string;
	riskScore: number;
	flags: ProposalFlag[];
	summary: string;
}

export interface IProposalScoreRepository {
	findByProposalId(proposalId: string): Promise<ProposalScore | null>;
	findByMultisigId(multisigId: string): Promise<ProposalScore[]>;
	upsertMany(scores: UpsertProposalScoreInput[]): Promise<ProposalScore[]>;
}

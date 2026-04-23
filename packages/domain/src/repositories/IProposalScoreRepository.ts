import type { ProposalFlag, ProposalScore } from "../entities/ProposalScore.js";

export interface UpsertProposalScoreInput {
	proposalId: string;
	riskScore: number;
	flags: ProposalFlag[];
	summary: string;
}

export interface UpdateProposalAIFieldsInput {
	aiAnalysis: string;
	recommendation: string;
}

export interface IProposalScoreRepository {
	findByProposalId(proposalId: string): Promise<ProposalScore | null>;
	findByProposalIds(proposalIds: string[]): Promise<ProposalScore[]>;
	findByMultisigId(multisigId: string): Promise<ProposalScore[]>;
	upsertMany(scores: UpsertProposalScoreInput[]): Promise<ProposalScore[]>;
	updateAIFields(
		proposalId: string,
		input: UpdateProposalAIFieldsInput,
	): Promise<ProposalScore>;
}

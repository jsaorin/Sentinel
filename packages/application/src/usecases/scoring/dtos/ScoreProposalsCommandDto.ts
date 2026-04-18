import type { Proposal } from "@sentinel/domain";

export type ScoreProposalsCommandInputDto = {
	multisigId: string;
	proposals: Proposal[];
};

export type ScoreProposalsCommandOutputDto = {
	scored: number;
	maxRiskScore: number;
};

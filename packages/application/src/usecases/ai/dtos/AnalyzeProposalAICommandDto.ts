export type AnalyzeProposalAICommandInputDto = {
	proposalId: string;
};

export type AnalyzeProposalAICommandOutputDto = {
	proposalId: string;
	aiAnalysis: string | null;
	recommendation: string | null;
};

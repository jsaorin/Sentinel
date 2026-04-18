export type SummarizeMultisigAICommandInputDto = {
	multisigId: string;
};

export type SummarizeMultisigAICommandOutputDto = {
	multisigId: string;
	aiSummary: string | null;
};

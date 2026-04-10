export type AnalyzeMultisigCommandInputDto = {
	multisigId: string;
	address: string;
};

export type AnalyzeMultisigCommandOutputDto = {
	multisigId: string;
	threshold: number;
	signersCount: number;
	proposalsCount: number;
};

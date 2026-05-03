export type ListNonceWarningsQueryInputDto = {
	multisigAddress: string;
};

export type NonceWarningOutputItem = {
	id: string;
	signerAddress: string;
	nonceAddress: string;
	authority: string;
	fundedBy: string | null;
	externallyFunded: boolean;
	severity: "WARNING" | "CRITICAL";
	detectedAt: Date;
};

export type ListNonceWarningsQueryOutputDto = {
	warnings: NonceWarningOutputItem[];
};

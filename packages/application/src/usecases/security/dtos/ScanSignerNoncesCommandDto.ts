export type ScanSignerNoncesCommandInputDto = {
	multisigId: string;
	signerId: string;
	signerAddress: string;
};

export type DetectedNonceAccount = {
	id: string;
	address: string;
	authority: string;
	fundedBy: string | null;
	externallyFunded: boolean;
};

export type ScanSignerNoncesCommandOutputDto = {
	scannedSignerAddress: string;
	totalNonceCount: number;
	newNonceCount: number;
	newNonces: DetectedNonceAccount[];
};

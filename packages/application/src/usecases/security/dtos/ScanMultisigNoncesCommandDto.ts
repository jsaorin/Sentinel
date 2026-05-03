export type ScanMultisigNoncesCommandInputDto = {
	multisigAddress: string;
};

export type ScanMultisigNoncesCommandOutputDto = {
	multisigAddress: string;
	signerCount: number;
	totalNoncesFound: number;
	newNoncesFound: number;
	durationMs: number;
};

export type ScanAllMultisigsNoncesCommandInputDto = Record<string, never>;

export type ScanAllMultisigsNoncesCommandOutputDto = {
	scannedMultisigCount: number;
	signerCount: number;
	totalNoncesFound: number;
	newNoncesFound: number;
	durationMs: number;
};

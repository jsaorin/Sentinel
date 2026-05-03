export class NonceWarningDto {
	id: string;
	signerAddress: string;
	nonceAddress: string;
	authority: string;
	fundedBy: string | null;
	externallyFunded: boolean;
	severity: "WARNING" | "CRITICAL";
	detectedAt: string;
}

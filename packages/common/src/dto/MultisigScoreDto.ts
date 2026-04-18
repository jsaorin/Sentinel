import type { MultisigWarningDto } from "./MultisigWarningDto.js";

export class MultisigScoreDto {
	overall: number;
	breakdown: {
		threshold: number;
		configAuthority: number;
		signerConcentration: number;
		signerCount: number;
	};
	warnings: MultisigWarningDto[];
	aiSummary: string | null;
	calculatedAt: string;
}

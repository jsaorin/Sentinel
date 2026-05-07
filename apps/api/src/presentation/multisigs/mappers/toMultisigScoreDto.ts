import type {
	MultisigScoreDto,
	MultisigWarningDto,
} from "@sentinel/common/dtos";
import type { MultisigScore } from "@sentinel/domain";

export function toMultisigScoreDto(score: MultisigScore): MultisigScoreDto {
	const warnings: MultisigWarningDto[] = score.warnings.map((w) => ({
		code: w.code,
		message: w.message,
		subject: w.subject,
		detectedAt: w.detectedAt.toISOString(),
	}));

	return {
		overall: score.overallScore,
		breakdown: {
			threshold: score.thresholdScore,
			configAuthority: score.configAuthorityScore,
			signerConcentration: score.signerConcentrationScore,
			signerCount: score.signerCountScore,
		},
		warnings,
		aiSummary: score.aiSummary,
		calculatedAt: score.calculatedAt.toISOString(),
	};
}

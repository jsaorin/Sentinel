import { MultisigScore, type MultisigScoreWarning } from "@sentinel/domain";
import type { MultisigScore as PrismaMultisigScore } from "../../generated/client/index.js";

export function mapPrismaMultisigScoreToDomain(
	record: PrismaMultisigScore,
): MultisigScore {
	return new MultisigScore({
		id: record.id,
		multisigId: record.multisigId,
		overallScore: record.overallScore,
		thresholdScore: record.thresholdScore,
		configAuthorityScore: record.configAuthorityScore,
		signerConcentrationScore: record.signerConcentrationScore,
		signerCountScore: record.signerCountScore,
		warnings: record.warnings as unknown as MultisigScoreWarning[],
		aiSummary: record.aiSummary,
		calculatedAt: record.calculatedAt,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
	});
}

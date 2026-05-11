import { MultisigScore, type MultisigScoreWarning } from "@sentinel/domain";
import type { MultisigScore as PrismaMultisigScore } from "../../generated/client/index.js";

type StoredWarning = {
	code: string;
	message: string;
	subject?: string | null;
	detectedAt?: string | Date | null;
};

export function mapPrismaMultisigScoreToDomain(
	record: PrismaMultisigScore,
): MultisigScore {
	const stored = (record.warnings as unknown as StoredWarning[]) ?? [];
	const warnings: MultisigScoreWarning[] = stored.map((w) => ({
		code: w.code,
		message: w.message,
		subject: w.subject ?? null,
		detectedAt: w.detectedAt ? new Date(w.detectedAt) : record.calculatedAt,
	}));

	return new MultisigScore({
		id: record.id,
		multisigId: record.multisigId,
		overallScore: record.overallScore,
		thresholdScore: record.thresholdScore,
		configAuthorityScore: record.configAuthorityScore,
		signerConcentrationScore: record.signerConcentrationScore,
		signerCountScore: record.signerCountScore,
		warnings,
		aiSummary: record.aiSummary,
		calculatedAt: record.calculatedAt,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
	});
}

import { type ProposalFlag, ProposalScore } from "@sentinel/domain";
import type { ProposalScore as PrismaProposalScore } from "../../generated/client/index.js";

export function mapPrismaProposalScoreToDomain(
	record: PrismaProposalScore,
): ProposalScore {
	return new ProposalScore({
		id: record.id,
		proposalId: record.proposalId,
		riskScore: record.riskScore,
		flags: record.flags as unknown as ProposalFlag[],
		summary: record.summary,
		aiAnalysis: record.aiAnalysis,
		recommendation: record.recommendation,
		calculatedAt: record.calculatedAt,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
	});
}

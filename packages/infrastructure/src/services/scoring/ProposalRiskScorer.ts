import type {
	ProposalScoreData,
	ProposalScoringContext,
} from "@sentinel/domain";
import { detectFlags } from "./FlagDetectors.js";
import { generateProposalSummary } from "./SummaryGenerator.js";

export function scoreProposalRisk(
	context: ProposalScoringContext,
): ProposalScoreData {
	const flags = detectFlags({
		decodedInstructions: context.decodedInstructions,
		historicalActions: context.historicalActions,
	});

	const rawScore = flags.reduce((acc, flag) => acc + flag.points, 0);
	const riskScore = Math.min(100, rawScore);
	const summary = generateProposalSummary(context.decodedInstructions, flags);

	return {
		proposalId: context.proposalId,
		riskScore,
		flags,
		summary,
	};
}

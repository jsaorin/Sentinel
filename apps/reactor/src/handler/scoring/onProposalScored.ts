import {
	type AnalyzeProposalAICommandHandler,
	APPLICATION_TYPES,
} from "@sentinel/application";
import type { Handler } from "../../messaging/types.js";
import type { ProposalScoredEvent } from "./schema.js";

export const onProposalScored: Handler<ProposalScoredEvent["data"]> = async (
	ctx,
) => {
	const { event, logger, container } = ctx;
	const { proposalId, multisigId, riskScore } = event.data;

	logger.info("proposal:scored:received", {
		proposalId,
		multisigId,
		riskScore,
	});

	const handler = container.get<AnalyzeProposalAICommandHandler>(
		APPLICATION_TYPES.AnalyzeProposalAICommandHandler,
	);

	const result = await handler.execute({ proposalId });

	logger.info("proposal:scored:processed", {
		proposalId,
		aiAnalysisGenerated: Boolean(result.aiAnalysis),
		recommendation: result.recommendation,
	});
};

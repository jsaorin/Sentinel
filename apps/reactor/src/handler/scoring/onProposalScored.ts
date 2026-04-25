import {
	APPLICATION_TYPES,
	type AnalyzeProposalAICommandHandler,
} from "@sentinel/application";
import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";
import { DOMAIN_TYPES, type IRealtimeService } from "@sentinel/domain";
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

	const realtime = container.get<IRealtimeService>(
		DOMAIN_TYPES.RealtimeService,
	);

	await realtime.emitToRoom(
		REALTIME_ROOMS.watcherFeed(),
		REALTIME_ACTIONS.AGENT_MESSAGE,
		{ message: `Analyzing proposal ${proposalId}` },
	);

	const handler = container.get<AnalyzeProposalAICommandHandler>(
		APPLICATION_TYPES.AnalyzeProposalAICommandHandler,
	);

	const result = await handler.execute({ proposalId });

	logger.info("proposal:scored:processed", {
		proposalId,
		aiAnalysisGenerated: Boolean(result.aiAnalysis),
		recommendation: result.recommendation,
	});

	await realtime.emitToRoom(
		REALTIME_ROOMS.watcherFeed(),
		REALTIME_ACTIONS.AGENT_MESSAGE,
		{ message: `Proposal ${proposalId} analysis complete` },
	);
};

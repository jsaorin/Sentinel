import {
	APPLICATION_TYPES,
	type SummarizeMultisigAICommandHandler,
} from "@sentinel/application";
import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";
import { DOMAIN_TYPES, type IRealtimeService } from "@sentinel/domain";
import type { Handler } from "../../messaging/types.js";
import type { MultisigScoredEvent } from "./schema.js";

export const onMultisigScored: Handler<MultisigScoredEvent["data"]> = async (
	ctx,
) => {
	const { event, logger, container } = ctx;
	const { multisigId, overallScore } = event.data;

	logger.info("multisig:scored:received", { multisigId, overallScore });

	const realtime = container.get<IRealtimeService>(
		DOMAIN_TYPES.RealtimeService,
	);

	await realtime.emitToRoom(
		REALTIME_ROOMS.watcherFeed(),
		REALTIME_ACTIONS.AGENT_MESSAGE,
		{ message: `Analyzing multisig ${multisigId}` },
	);

	const handler = container.get<SummarizeMultisigAICommandHandler>(
		APPLICATION_TYPES.SummarizeMultisigAICommandHandler,
	);

	const result = await handler.execute({ multisigId });

	logger.info("multisig:scored:processed", {
		multisigId,
		aiSummaryGenerated: Boolean(result.aiSummary),
	});

	await realtime.emitToRoom(
		REALTIME_ROOMS.watcherFeed(),
		REALTIME_ACTIONS.AGENT_MESSAGE,
		{ message: `Multisig ${multisigId} analysis complete` },
	);
};

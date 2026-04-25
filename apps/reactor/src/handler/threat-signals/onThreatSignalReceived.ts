import {
	APPLICATION_TYPES,
	type AnalyzeThreatSignalCommandHandler,
} from "@sentinel/application";
import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";
import { DOMAIN_TYPES, type IRealtimeService } from "@sentinel/domain";
import type { Handler } from "../../messaging/types.js";
import type { ThreatSignalReceivedEvent } from "./schema.js";

export const onThreatSignalReceived: Handler<
	ThreatSignalReceivedEvent["data"]
> = async (ctx) => {
	const { event, logger, container } = ctx;
	const { source, externalId, content, capturedAt, sourceUrl } = event.data;

	logger.info("threat-signal:received", {
		sourceKind: source.kind,
		sourceIdentifier: source.identifier,
		externalId,
	});

	const realtime = container.get<IRealtimeService>(
		DOMAIN_TYPES.RealtimeService,
	);

	await realtime.emitToRoom(
		REALTIME_ROOMS.watcherFeed(),
		REALTIME_ACTIONS.AGENT_MESSAGE,
		{ message: `Analyzing threat signal ${externalId}` },
	);

	const handler = container.get<AnalyzeThreatSignalCommandHandler>(
		APPLICATION_TYPES.AnalyzeThreatSignalCommandHandler,
	);

	const result = await handler.execute({
		source,
		externalId,
		content,
		capturedAt: new Date(capturedAt),
		sourceUrl: sourceUrl ?? null,
	});

	logger.info("threat-signal:processed", {
		signalId: result.signalId,
		isThreat: result.isThreat,
		entityCount: result.entityCount,
		skipped: result.skipped,
	});

	if (!result.skipped) {
		await realtime.emitToRoom(
			REALTIME_ROOMS.watcherFeed(),
			REALTIME_ACTIONS.NEW_THREAT_SIGNAL,
			{ id: result.signalId },
		);
	}

	await realtime.emitToRoom(
		REALTIME_ROOMS.watcherFeed(),
		REALTIME_ACTIONS.AGENT_MESSAGE,
		{ message: `Threat analysis complete for ${externalId}` },
	);
};

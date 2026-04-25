import {
	type AnalyzeThreatSignalCommandHandler,
	APPLICATION_TYPES,
} from "@sentinel/application";
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
};

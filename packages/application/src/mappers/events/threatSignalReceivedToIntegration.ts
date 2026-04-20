import type { ThreatSignalReceived, ThreatSource } from "@sentinel/domain";
import type { IntegrationEvent } from "../../ports/IEventPublisher.js";

export type ThreatSignalReceivedPayload = {
	source: ThreatSource;
	externalId: string;
	content: string;
	capturedAt: string;
};

export function threatSignalReceivedToIntegrationEvent(
	ev: ThreatSignalReceived,
): {
	routingKey: string;
	event: IntegrationEvent<ThreatSignalReceivedPayload>;
} {
	return {
		routingKey: "threat.signal.received",
		event: {
			id: `${ev.source.kind}:${ev.source.identifier}:${ev.externalId}`,
			type: "threat.signal.received",
			time: ev.occurredAt.toISOString(),
			data: {
				source: ev.source,
				externalId: ev.externalId,
				content: ev.content,
				capturedAt: ev.capturedAt.toISOString(),
			},
		},
	};
}

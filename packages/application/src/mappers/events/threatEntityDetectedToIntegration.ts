import type { AffectedEntity, ThreatSignal } from "@sentinel/domain";
import type { IntegrationEvent } from "../../ports/IEventPublisher.js";

export type ThreatEntityDetectedPayload = {
	threatSignalEntityId: string;
	threatSignalId: string;
};

export function threatEntityDetectedToIntegrationEvent(
	signal: ThreatSignal,
	entity: AffectedEntity,
	detectedAt: Date = new Date(),
): {
	routingKey: string;
	event: IntegrationEvent<ThreatEntityDetectedPayload>;
} {
	if (!signal.id) {
		throw new Error(
			"Cannot emit threat.entity.detected for a signal without an id",
		);
	}
	if (!entity.id) {
		throw new Error(
			"Cannot emit threat.entity.detected for an entity without an id",
		);
	}

	return {
		routingKey: "threat.entity.detected",
		event: {
			id: entity.id,
			type: "threat.entity.detected",
			time: detectedAt.toISOString(),
			data: {
				threatSignalEntityId: entity.id,
				threatSignalId: signal.id,
			},
		},
	};
}

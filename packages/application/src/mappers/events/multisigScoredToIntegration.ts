import type { MultisigScored } from "@sentinel/domain";
import type { IntegrationEvent } from "../../ports/IEventPublisher.js";

export function multisigScoredToIntegrationEvent(ev: MultisigScored): {
	routingKey: string;
	event: IntegrationEvent<{ multisigId: string; overallScore: number }>;
} {
	return {
		routingKey: "multisig.scored",
		event: {
			id: `${ev.occurredAt.toISOString()}-${ev.multisigId}`,
			type: "multisig.scored",
			time: ev.occurredAt.toISOString(),
			data: {
				multisigId: ev.multisigId,
				overallScore: ev.overallScore,
			},
		},
	};
}

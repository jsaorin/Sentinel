import type { MultisigCreated } from "@sentinel/domain";
import type { IntegrationEvent } from "../../ports/IEventPublisher.js";

export function multisigCreatedToIntegrationEvent(ev: MultisigCreated): {
	routingKey: string;
	event: IntegrationEvent<{ multisigId: string; address: string }>;
} {
	return {
		routingKey: "multisig.created",
		event: {
			id: `${ev.occurredAt.toISOString()}-${ev.multisigId}`,
			type: "multisig.created",
			time: ev.occurredAt.toISOString(),
			data: { multisigId: ev.multisigId, address: ev.address },
		},
	};
}

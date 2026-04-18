import type { ProposalScored } from "@sentinel/domain";
import type { IntegrationEvent } from "../../ports/IEventPublisher.js";

export function proposalScoredToIntegrationEvent(ev: ProposalScored): {
	routingKey: string;
	event: IntegrationEvent<{
		multisigId: string;
		proposalId: string;
		riskScore: number;
	}>;
} {
	return {
		routingKey: "proposal.scored",
		event: {
			id: `${ev.occurredAt.toISOString()}-${ev.proposalId}`,
			type: "proposal.scored",
			time: ev.occurredAt.toISOString(),
			data: {
				multisigId: ev.multisigId,
				proposalId: ev.proposalId,
				riskScore: ev.riskScore,
			},
		},
	};
}

import type { DomainEvent } from "./DomainEvent.js";

export class ProposalScored implements DomainEvent {
	readonly name = "ProposalScored";
	constructor(
		public readonly multisigId: string,
		public readonly proposalId: string,
		public readonly riskScore: number,
		public readonly occurredAt = new Date(),
	) {}
}

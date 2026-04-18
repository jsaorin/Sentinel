import type { DomainEvent } from "./DomainEvent.js";

export class MultisigScored implements DomainEvent {
	readonly name = "MultisigScored";
	constructor(
		public readonly multisigId: string,
		public readonly overallScore: number,
		public readonly occurredAt = new Date(),
	) {}
}

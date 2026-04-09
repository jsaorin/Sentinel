import type { DomainEvent } from "./DomainEvent.js";

export class MultisigCreated implements DomainEvent {
	readonly name = "MultisigCreated";
	constructor(
		public readonly multisigId: string,
		public readonly address: string,
		public readonly occurredAt = new Date(),
	) {}
}

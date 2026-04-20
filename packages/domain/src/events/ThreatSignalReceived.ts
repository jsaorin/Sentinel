import type { DomainEvent } from "./DomainEvent.js";

export type ThreatSourceKind = "telegram" | "twitter" | "rss";

export type ThreatSource = {
	kind: ThreatSourceKind;
	identifier: string;
	label?: string;
};

export class ThreatSignalReceived implements DomainEvent {
	readonly name = "ThreatSignalReceived";
	constructor(
		public readonly source: ThreatSource,
		public readonly externalId: string,
		public readonly content: string,
		public readonly capturedAt: Date,
		public readonly occurredAt = new Date(),
	) {}
}

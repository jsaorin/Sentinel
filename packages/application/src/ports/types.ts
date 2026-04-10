export const PORT_TYPES = {
	EventPublisher: Symbol.for("EventPublisher"),
	EventPublisherConfig: Symbol.for("EventPublisherConfig"),
	OutboxEventPublisher: Symbol.for("OutboxEventPublisher"),
	InboxStore: Symbol.for("InboxStore"),
};

export type PortTypes = typeof PORT_TYPES;

export const PORT_TYPES = {
	EventPublisher: Symbol.for("EventPublisher"),
	EventPublisherConfig: Symbol.for("EventPublisherConfig"),
	OutboxEventPublisher: Symbol.for("OutboxEventPublisher"),
};

export type PortTypes = typeof PORT_TYPES;

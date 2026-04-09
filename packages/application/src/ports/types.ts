export const PORT_TYPES = {
	EventPublisher: Symbol.for("EventPublisher"),
	EventPublisherConfig: Symbol.for("EventPublisherConfig"),
};

export type PortTypes = typeof PORT_TYPES;

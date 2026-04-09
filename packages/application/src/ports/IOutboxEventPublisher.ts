import type {
	EventPublishOptions,
	IntegrationEvent,
} from "./IEventPublisher.js";

export interface IOutboxEventPublisher {
	publish<T>(
		event: IntegrationEvent<T>,
		opts?: EventPublishOptions,
	): Promise<void>;
}

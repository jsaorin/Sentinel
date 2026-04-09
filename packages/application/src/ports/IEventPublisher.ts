export interface IntegrationEvent<T = unknown> {
	id: string;
	type: string;
	time: string;
	data: T;
	metadata?: Record<string, unknown>;
}

export type EventPublisherConfig = {
	url: string;
	exchangeName?: string;
	exchangeType?: "topic" | "direct";
	confirmTimeoutMs?: number;
	appId?: string;
};

export interface EventPublishOptions {
	routingKey?: string;
	headers?: Record<string, unknown>;
}

export interface IEventPublisher {
	publish<T>(
		event: IntegrationEvent<T>,
		opts?: EventPublishOptions,
	): Promise<void>;
	close?(): Promise<void>;
}

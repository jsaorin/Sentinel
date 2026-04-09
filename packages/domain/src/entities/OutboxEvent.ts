export enum OutboxEventStatus {
	PENDING = "PENDING",
	PUBLISHED = "PUBLISHED",
	FAILED = "FAILED",
}

export class OutboxEvent {
	readonly id: string;
	readonly exchange: string;
	readonly routingKey: string;
	readonly event: Record<string, unknown>;
	status: OutboxEventStatus;
	attempts: number;
	lastError?: string | null;
	readonly createdAt: Date;
	updatedAt: Date;

	constructor(params: {
		id: string;
		exchange?: string;
		routingKey: string;
		event: Record<string, unknown>;
		status?: OutboxEventStatus;
		attempts?: number;
		lastError?: string | null;
		createdAt?: Date;
		updatedAt?: Date;
	}) {
		this.id = params.id;
		this.exchange = params.exchange ?? "reactor.events";
		this.routingKey = params.routingKey;
		this.event = params.event;
		this.status = params.status ?? OutboxEventStatus.PENDING;
		this.attempts = params.attempts ?? 0;
		this.lastError = params.lastError ?? null;
		this.createdAt = params.createdAt ?? new Date();
		this.updatedAt = params.updatedAt ?? new Date();
	}
}

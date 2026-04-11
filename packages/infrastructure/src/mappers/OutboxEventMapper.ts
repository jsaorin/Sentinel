import type { OutboxEvent as PrismaOutboxEvent } from "../../generated/client/index.js";
import { OutboxEvent, type OutboxEventStatus } from "@sentinel/domain";

export function mapOutboxEventToDomain(record: PrismaOutboxEvent): OutboxEvent {
	return new OutboxEvent({
		id: record.id,
		exchange: record.exchange,
		routingKey: record.routingKey,
		event: record.event as Record<string, unknown>,
		status: record.status as OutboxEventStatus,
		attempts: record.attempts,
		lastError: record.lastError,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
	});
}

import { OutboxEventStatus } from "@sentinel/domain";
import type { OutboxEvent } from "@sentinel/domain";
import type { IOutboxEventRepository } from "@sentinel/domain/repositories";
import type { Prisma } from "../../generated/client/index.js";
import { injectable } from "inversify";
import { mapOutboxEventToDomain } from "../mappers/OutboxEventMapper.js";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";

@injectable()
export class OutboxEventRepository implements IOutboxEventRepository {
	private get prisma() {
		return getPrismaClient();
	}

	async save(event: OutboxEvent): Promise<OutboxEvent> {
		const created = await this.prisma.outboxEvent.create({
			data: {
				id: event.id,
				exchange: event.exchange,
				routingKey: event.routingKey,
				event: event.event as Prisma.InputJsonValue,
				status: event.status,
				attempts: event.attempts,
				lastError: event.lastError,
			},
		});
		return mapOutboxEventToDomain(created);
	}

	async saveMany(events: OutboxEvent[]): Promise<void> {
		if (events.length === 0) return;

		await this.prisma.outboxEvent.createMany({
			data: events.map((e) => ({
				id: e.id,
				exchange: e.exchange,
				routingKey: e.routingKey,
				event: e.event as Prisma.InputJsonValue,
				status: e.status,
				attempts: e.attempts,
				lastError: e.lastError,
			})),
		});
	}

	async findPending(limit: number): Promise<OutboxEvent[]> {
		const records = await this.prisma.outboxEvent.findMany({
			where: { status: OutboxEventStatus.PENDING },
			orderBy: { createdAt: "asc" },
			take: limit,
		});
		return records.map(mapOutboxEventToDomain);
	}

	async markPublished(id: string): Promise<void> {
		await this.prisma.outboxEvent.update({
			where: { id },
			data: { status: OutboxEventStatus.PUBLISHED },
		});
	}

	async markFailed(id: string, error: string): Promise<void> {
		await this.prisma.outboxEvent.update({
			where: { id },
			data: {
				status: OutboxEventStatus.FAILED,
				lastError: error.slice(0, 2000),
				attempts: { increment: 1 },
			},
		});
	}

	async deletePublishedBefore(date: Date): Promise<number> {
		const result = await this.prisma.outboxEvent.deleteMany({
			where: {
				status: OutboxEventStatus.PUBLISHED,
				updatedAt: { lt: date },
			},
		});
		return result.count;
	}
}

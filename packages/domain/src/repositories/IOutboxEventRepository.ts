import type { OutboxEvent } from "../entities/OutboxEvent.js";

export interface IOutboxEventRepository {
	save(event: OutboxEvent): Promise<OutboxEvent>;
	saveMany(events: OutboxEvent[]): Promise<void>;
	findPending(limit: number): Promise<OutboxEvent[]>;
	markPublished(id: string): Promise<void>;
	markFailed(id: string, error: string): Promise<void>;
	deletePublishedBefore(date: Date): Promise<number>;
}

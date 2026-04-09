import {
	APPLICATION_TYPES,
	type EventPublishOptions,
	type IEventPublisher,
	type IOutboxEventPublisher,
	type IntegrationEvent,
} from "@sentinel/application";
import type { ILogger } from "@sentinel/common/logger";
import { DOMAIN_TYPES } from "@sentinel/domain";
import { OutboxEvent } from "@sentinel/domain/entities";
import type { IOutboxEventRepository } from "@sentinel/domain/repositories";
import { inject, injectable } from "inversify";

@injectable()
export class OutboxAwareEventPublisher implements IOutboxEventPublisher {
	constructor(
		@inject(APPLICATION_TYPES.EventPublisher)
		private eventPublisher: IEventPublisher,
		@inject(DOMAIN_TYPES.OutboxEventRepository)
		private outboxRepository: IOutboxEventRepository,
		@inject(DOMAIN_TYPES.Logger)
		private logger: ILogger,
	) {}

	async publish<T>(
		event: IntegrationEvent<T>,
		opts?: EventPublishOptions,
	): Promise<void> {
		const enrichedEvent = {
			...event,
			metadata: {
				...event.metadata,
				publishedAt: new Date().toISOString(),
			},
		};

		const routingKey = opts?.routingKey ?? event.type ?? "";
		const eventId = event.id || crypto.randomUUID();

		const outboxEvent = new OutboxEvent({
			id: eventId,
			exchange: "reactor.events",
			routingKey,
			event: enrichedEvent as unknown as Record<string, unknown>,
			attempts: 1,
		});

		await this.outboxRepository.save(outboxEvent);

		this.logger.info("Event saved to outbox, attempting direct publish", {
			id: eventId,
			type: event.type,
			routingKey,
		});

		try {
			await this.eventPublisher.publish(
				enrichedEvent as IntegrationEvent<T>,
				opts,
			);

			await this.outboxRepository.markPublished(eventId);

			this.logger.info("Event published directly and marked as PUBLISHED", {
				id: eventId,
				type: event.type,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);

			this.logger.warning(
				"Direct publish failed, event stays PENDING for poller retry",
				{
					id: eventId,
					type: event.type,
					error: errorMessage,
				},
			);

			await this.outboxRepository.markFailed(eventId, errorMessage);
		}
	}
}

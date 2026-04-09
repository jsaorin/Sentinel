import { inject, injectFromBase, injectable } from "inversify";
import type { IOutboxEventPublisher } from "../../../ports/IOutboxEventPublisher.js";
import type { IntegrationEvent } from "../../../ports/IEventPublisher.js";
import { APPLICATION_TYPES } from "../../../types.js";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	SaveWebhookEventCommandInputDto,
	SaveWebhookEventCommandOutputDto,
} from "../dtos/SaveWebhookEventCommandDto.js";

@injectable()
@injectFromBase()
export class SaveWebhookEventCommandHandler extends BaseUseCase<
	SaveWebhookEventCommandInputDto,
	SaveWebhookEventCommandOutputDto
> {
	constructor(
		@inject(APPLICATION_TYPES.OutboxEventPublisher)
		private eventPublisher: IOutboxEventPublisher,
	) {
		super();
	}

	async execute(
		input: SaveWebhookEventCommandInputDto,
	): Promise<SaveWebhookEventCommandOutputDto> {
		this.logger.info("Processing webhook events", {
			count: input.payload.length,
		});

		for (const item of input.payload) {
			const integrationEvent: IntegrationEvent = {
				id: crypto.randomUUID(),
				type: "webhook.helius.received",
				time: new Date().toISOString(),
				data: item,
			};

			await this.eventPublisher.publish(integrationEvent, {
				routingKey: "webhook.helius.received",
			});
		}

		return { savedCount: input.payload.length };
	}
}

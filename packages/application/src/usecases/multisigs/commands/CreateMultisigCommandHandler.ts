import {
	DOMAIN_TYPES,
	MultisigCreated,
	WebhookType,
	type IHeliusWebhookService,
	type IMultisigRepository,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { multisigCreatedToIntegrationEvent } from "../../../mappers/events/multisigCreatedToIntegration.js";
import type { IOutboxEventPublisher } from "../../../ports/IOutboxEventPublisher.js";
import { APPLICATION_TYPES } from "../../../types.js";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	CreateMultisigCommandInputDto,
	CreateMultisigCommandOutputDto,
} from "../dtos/CreateMultisigCommandDto.js";

@injectable()
@injectFromBase()
export class CreateMultisigCommandHandler extends BaseUseCase<
	CreateMultisigCommandInputDto,
	CreateMultisigCommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.HeliusWebhookService)
		private heliusWebhookService: IHeliusWebhookService,
		@inject(APPLICATION_TYPES.OutboxEventPublisher)
		private eventPublisher: IOutboxEventPublisher,
	) {
		super();
	}

	async execute(
		input: CreateMultisigCommandInputDto,
	): Promise<CreateMultisigCommandOutputDto> {
		let multisig = await this.multisigRepository.findByAddress(
			input.address,
		);
		const isNew = !multisig;

		if (!multisig) {
			multisig = await this.multisigRepository.create({
				address: input.address,
				label: input.label ?? null,
			});

			this.logger.info("Multisig created", {
				id: multisig.id,
				address: multisig.address,
			});
		}

		await this.heliusWebhookService.addAddressToWebhook(
			multisig.address,
			WebhookType.MULTISIG_ACTIVITY,
		);

		if (isNew) {
			const domainEvent = new MultisigCreated(
				multisig.id,
				multisig.address,
			);
			const { routingKey, event } =
				multisigCreatedToIntegrationEvent(domainEvent);
			await this.eventPublisher.publish(event, { routingKey });
		}

		return {
			id: multisig.id,
			address: multisig.address,
			label: multisig.label,
			createdAt: multisig.createdAt.toISOString(),
		};
	}
}

import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";
import {
	DOMAIN_TYPES,
	type IRealtimeService,
	ThreatSignalReceived,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { threatSignalReceivedToIntegrationEvent } from "../../../mappers/events/threatSignalReceivedToIntegration.js";
import type { IOutboxEventPublisher } from "../../../ports/IOutboxEventPublisher.js";
import { APPLICATION_TYPES } from "../../../types.js";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	IngestThreatSignalCommandInputDto,
	IngestThreatSignalCommandOutputDto,
} from "../dtos/IngestThreatSignalCommandDto.js";

@injectable()
@injectFromBase()
export class IngestThreatSignalCommandHandler extends BaseUseCase<
	IngestThreatSignalCommandInputDto,
	IngestThreatSignalCommandOutputDto
> {
	constructor(
		@inject(APPLICATION_TYPES.OutboxEventPublisher)
		private eventPublisher: IOutboxEventPublisher,
		@inject(DOMAIN_TYPES.RealtimeService)
		private realtime: IRealtimeService,
	) {
		super();
	}

	async execute(
		input: IngestThreatSignalCommandInputDto,
	): Promise<IngestThreatSignalCommandOutputDto> {
		const domainEvent = new ThreatSignalReceived(
			input.source,
			input.externalId,
			input.content,
			input.capturedAt,
			input.sourceUrl ?? null,
		);

		const { routingKey, event } =
			threatSignalReceivedToIntegrationEvent(domainEvent);

		this.logger.info("Ingesting threat signal", {
			eventId: event.id,
			sourceKind: input.source.kind,
			sourceIdentifier: input.source.identifier,
			externalId: input.externalId,
		});

		await this.realtime.emitToRoom(
			REALTIME_ROOMS.watcherFeed(),
			REALTIME_ACTIONS.AGENT_MESSAGE,
			{
				message: `Received signal from ${input.source.kind}:${input.source.identifier}`,
			},
		);

		await this.eventPublisher.publish(event, { routingKey });

		return { eventId: event.id, published: true };
	}
}

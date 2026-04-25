import {
	AffectedEntity,
	DOMAIN_TYPES,
	type IAIAnalysisService,
	type IThreatSignalRepository,
	ThreatSignal,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { threatEntityDetectedToIntegrationEvent } from "../../../mappers/events/threatEntityDetectedToIntegration.js";
import type { IOutboxEventPublisher } from "../../../ports/IOutboxEventPublisher.js";
import { APPLICATION_TYPES } from "../../../types.js";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	AnalyzeThreatSignalCommandInputDto,
	AnalyzeThreatSignalCommandOutputDto,
} from "../dtos/AnalyzeThreatSignalCommandDto.js";

@injectable()
@injectFromBase()
export class AnalyzeThreatSignalCommandHandler extends BaseUseCase<
	AnalyzeThreatSignalCommandInputDto,
	AnalyzeThreatSignalCommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.ThreatSignalRepository)
		private threatSignalRepository: IThreatSignalRepository,
		@inject(DOMAIN_TYPES.AIAnalysisService)
		private aiAnalysisService: IAIAnalysisService,
		@inject(APPLICATION_TYPES.OutboxEventPublisher)
		private eventPublisher: IOutboxEventPublisher,
	) {
		super();
	}

	async execute(
		input: AnalyzeThreatSignalCommandInputDto,
	): Promise<AnalyzeThreatSignalCommandOutputDto> {
		const { source, externalId, content, capturedAt, sourceUrl } = input;

		const existing = await this.threatSignalRepository.findByExternalRef(
			source,
			externalId,
		);

		if (existing?.analyzedAt && existing.id) {
			this.logger.info("threat-signal:already-analyzed", {
				signalId: existing.id,
				sourceKind: source.kind,
				externalId,
			});
			return {
				signalId: existing.id,
				isThreat: existing.isThreat,
				entityCount: existing.entities.length,
				skipped: true,
			};
		}

		this.logger.info("threat-signal:analyzing", {
			sourceKind: source.kind,
			sourceIdentifier: source.identifier,
			externalId,
			contentLength: content.length,
		});

		const analysis = await this.aiAnalysisService.analyzeThreatSignal({
			source,
			content,
		});

		const domainEntities = analysis.entities.map(
			(entity) =>
				new AffectedEntity(
					entity.kind,
					entity.address,
					entity.role,
					entity.contextSnippet,
				),
		);

		const signal = new ThreatSignal({
			id: existing?.id ?? null,
			source,
			externalId,
			content,
			capturedAt,
			sourceUrl: sourceUrl ?? existing?.sourceUrl ?? null,
			isThreat: analysis.isThreat,
			severity: analysis.severity,
			category: analysis.category,
			summary: analysis.summary,
			rawAnalysisJson: analysis.rawAnalysisJson,
			entities: domainEntities,
			analyzedAt: new Date(),
		});

		const saved = await this.threatSignalRepository.save(signal);

		this.logger.info("threat-signal:analyzed", {
			signalId: saved.id,
			isThreat: saved.isThreat,
			severity: saved.severity,
			category: saved.category,
			entityCount: saved.entities.length,
		});

		let emittedEntityEvents = 0;
		if (saved.isThreat && saved.id) {
			const detectedAt = new Date();
			for (const entity of saved.entities) {
				try {
					const { routingKey, event } = threatEntityDetectedToIntegrationEvent(
						saved,
						entity,
						detectedAt,
					);
					await this.eventPublisher.publish(event, { routingKey });
					emittedEntityEvents += 1;
				} catch (error) {
					this.logger.error("threat-entity:publish-failed", {
						signalId: saved.id,
						address: entity.address,
						kind: entity.kind,
						error: error instanceof Error ? error.message : String(error),
					});
				}
			}
			this.logger.info("threat-entity:events-emitted", {
				signalId: saved.id,
				emitted: emittedEntityEvents,
				total: saved.entities.length,
			});
		}

		return {
			signalId: saved.id ?? "",
			isThreat: saved.isThreat,
			entityCount: saved.entities.length,
			skipped: false,
		};
	}
}

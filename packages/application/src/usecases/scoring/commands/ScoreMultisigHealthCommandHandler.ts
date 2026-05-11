import {
	DOMAIN_TYPES,
	type IMultisigRepository,
	type IMultisigScoreRepository,
	type IMultisigThreatExposureRepository,
	type INonceAccountRepository,
	type IScoringService,
	type ISignerRepository,
	MultisigScored,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { multisigScoredToIntegrationEvent } from "../../../mappers/events/multisigScoredToIntegration.js";
import type { IOutboxEventPublisher } from "../../../ports/IOutboxEventPublisher.js";
import { APPLICATION_TYPES } from "../../../types.js";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	ScoreMultisigHealthCommandInputDto,
	ScoreMultisigHealthCommandOutputDto,
} from "../dtos/ScoreMultisigHealthCommandDto.js";

@injectable()
@injectFromBase()
export class ScoreMultisigHealthCommandHandler extends BaseUseCase<
	ScoreMultisigHealthCommandInputDto,
	ScoreMultisigHealthCommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.SignerRepository)
		private signerRepository: ISignerRepository,
		@inject(DOMAIN_TYPES.MultisigScoreRepository)
		private multisigScoreRepository: IMultisigScoreRepository,
		@inject(DOMAIN_TYPES.ScoringService)
		private scoringService: IScoringService,
		@inject(APPLICATION_TYPES.OutboxEventPublisher)
		private eventPublisher: IOutboxEventPublisher,
		@inject(DOMAIN_TYPES.NonceAccountRepository)
		private nonceAccountRepository: INonceAccountRepository,
		@inject(DOMAIN_TYPES.MultisigThreatExposureRepository)
		private threatExposureRepository: IMultisigThreatExposureRepository,
	) {
		super();
	}

	async execute(
		input: ScoreMultisigHealthCommandInputDto,
	): Promise<ScoreMultisigHealthCommandOutputDto> {
		const { multisigId } = input;

		this.logger.info("Scoring multisig health", { multisigId });

		const [multisig, signers, nonceAccounts, threatExposures, previousScore] =
			await Promise.all([
				this.multisigRepository.findById(multisigId),
				this.signerRepository.findByMultisigId(multisigId),
				this.nonceAccountRepository.findByMultisigId(multisigId),
				this.threatExposureRepository.findByMultisigId(multisigId),
				this.multisigScoreRepository.findByMultisigId(multisigId),
			]);

		const data = this.scoringService.scoreMultisig({
			threshold: multisig?.threshold ?? null,
			configAuthority: multisig?.configAuthority ?? null,
			signers,
			nonceAccounts,
			threatExposures,
			previousWarnings: previousScore?.warnings ?? [],
		});

		await this.multisigScoreRepository.upsert({
			multisigId,
			overallScore: data.overallScore,
			thresholdScore: data.thresholdScore,
			configAuthorityScore: data.configAuthorityScore,
			signerConcentrationScore: data.signerConcentrationScore,
			signerCountScore: data.signerCountScore,
			warnings: data.warnings,
		});

		this.logger.info("Multisig health scored", {
			multisigId,
			overallScore: data.overallScore,
			warnings: data.warnings.length,
		});

		const domainEvent = new MultisigScored(multisigId, data.overallScore);
		const { routingKey, event } = multisigScoredToIntegrationEvent(domainEvent);
		await this.eventPublisher.publish(event, { routingKey });

		return {
			multisigId,
			overallScore: data.overallScore,
			thresholdScore: data.thresholdScore,
			configAuthorityScore: data.configAuthorityScore,
			signerConcentrationScore: data.signerConcentrationScore,
			signerCountScore: data.signerCountScore,
			warnings: data.warnings,
		};
	}
}

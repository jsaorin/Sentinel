import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";
import {
	DOMAIN_TYPES,
	type IMultisigRepository,
	type IMultisigScoreRepository,
	type INonceAccountRepository,
	type IRealtimeService,
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
		@inject(DOMAIN_TYPES.RealtimeService)
		private realtime: IRealtimeService,
		@inject(DOMAIN_TYPES.NonceAccountRepository)
		private nonceAccountRepository: INonceAccountRepository,
	) {
		super();
	}

	async execute(
		input: ScoreMultisigHealthCommandInputDto,
	): Promise<ScoreMultisigHealthCommandOutputDto> {
		const { multisigId } = input;

		this.logger.info("Scoring multisig health", { multisigId });

		const [multisig, signers, nonceAccounts] = await Promise.all([
			this.multisigRepository.findById(multisigId),
			this.signerRepository.findByMultisigId(multisigId),
			this.nonceAccountRepository.findByMultisigId(multisigId),
		]);

		const data = this.scoringService.scoreMultisig({
			threshold: multisig?.threshold ?? null,
			configAuthority: multisig?.configAuthority ?? null,
			signers,
			nonceAccounts,
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

		await this.realtime.emitToRoom(
			REALTIME_ROOMS.multisig(multisigId),
			REALTIME_ACTIONS.NEW_ANALYSIS_MULTISIG,
			{ multisigId },
		);

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

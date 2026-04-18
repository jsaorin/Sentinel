import {
	DOMAIN_TYPES,
	type IMultisigRepository,
	type IMultisigScoreRepository,
	type IScoringService,
	type ISignerRepository,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
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
	) {
		super();
	}

	async execute(
		input: ScoreMultisigHealthCommandInputDto,
	): Promise<ScoreMultisigHealthCommandOutputDto> {
		const { multisigId } = input;

		this.logger.info("Scoring multisig health", { multisigId });

		const [multisig, signers] = await Promise.all([
			this.multisigRepository.findById(multisigId),
			this.signerRepository.findByMultisigId(multisigId),
		]);

		const data = this.scoringService.scoreMultisig({
			threshold: multisig?.threshold ?? null,
			configAuthority: multisig?.configAuthority ?? null,
			signers,
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

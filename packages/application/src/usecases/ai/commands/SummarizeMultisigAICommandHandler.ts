import {
	DOMAIN_TYPES,
	type IAIAnalysisService,
	type IMultisigRepository,
	type IMultisigScoreRepository,
	type IProposalScoreRepository,
	type ISignerRepository,
	type MultisigAnalysisContext,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	SummarizeMultisigAICommandInputDto,
	SummarizeMultisigAICommandOutputDto,
} from "../dtos/SummarizeMultisigAICommandDto.js";

const RECENT_PROPOSALS_LIMIT = 10;

@injectable()
@injectFromBase()
export class SummarizeMultisigAICommandHandler extends BaseUseCase<
	SummarizeMultisigAICommandInputDto,
	SummarizeMultisigAICommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.SignerRepository)
		private signerRepository: ISignerRepository,
		@inject(DOMAIN_TYPES.MultisigScoreRepository)
		private multisigScoreRepository: IMultisigScoreRepository,
		@inject(DOMAIN_TYPES.ProposalScoreRepository)
		private proposalScoreRepository: IProposalScoreRepository,
		@inject(DOMAIN_TYPES.AIAnalysisService)
		private aiAnalysisService: IAIAnalysisService,
	) {
		super();
	}

	async execute(
		input: SummarizeMultisigAICommandInputDto,
	): Promise<SummarizeMultisigAICommandOutputDto> {
		const { multisigId } = input;

		this.logger.info("Summarising multisig with AI", { multisigId });

		const [multisig, signers, score, proposalScores] = await Promise.all([
			this.multisigRepository.findById(multisigId),
			this.signerRepository.findByMultisigId(multisigId),
			this.multisigScoreRepository.findByMultisigId(multisigId),
			this.proposalScoreRepository.findByMultisigId(multisigId),
		]);

		if (!multisig || !score) {
			this.logger.warning("AI summary skipped: missing multisig or score", {
				multisigId,
				hasMultisig: Boolean(multisig),
				hasScore: Boolean(score),
			});
			return { multisigId, aiSummary: null };
		}

		const recentProposals = proposalScores
			.slice(-RECENT_PROPOSALS_LIMIT)
			.map((p) => ({
				proposalId: p.proposalId,
				riskScore: p.riskScore,
				summary: p.summary,
			}));

		const context: MultisigAnalysisContext = {
			multisigId,
			address: multisig.address,
			threshold: multisig.threshold,
			configAuthority: multisig.configAuthority,
			signerCount: signers.length,
			overallScore: score.overallScore,
			warnings: score.warnings,
			recentProposals,
		};

		try {
			const { aiSummary } =
				await this.aiAnalysisService.summarizeMultisig(context);
			await this.multisigScoreRepository.updateAISummary(multisigId, aiSummary);
			this.logger.info("AI summary stored", { multisigId });
			return { multisigId, aiSummary };
		} catch (error) {
			this.logger.error("AI summary failed", {
				multisigId,
				error: error instanceof Error ? error.message : String(error),
			});
			return { multisigId, aiSummary: null };
		}
	}
}

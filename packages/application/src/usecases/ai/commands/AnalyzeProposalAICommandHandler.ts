import {
	DOMAIN_TYPES,
	type IAIAnalysisService,
	type IDecodedInstructionRepository,
	type IMultisigRepository,
	type IMultisigScoreRepository,
	type IProposalInstructionRepository,
	type IProposalRepository,
	type IProposalScoreRepository,
	type ISignerRepository,
	type ProposalAnalysisContext,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	AnalyzeProposalAICommandInputDto,
	AnalyzeProposalAICommandOutputDto,
} from "../dtos/AnalyzeProposalAICommandDto.js";

@injectable()
@injectFromBase()
export class AnalyzeProposalAICommandHandler extends BaseUseCase<
	AnalyzeProposalAICommandInputDto,
	AnalyzeProposalAICommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.ProposalRepository)
		private proposalRepository: IProposalRepository,
		@inject(DOMAIN_TYPES.ProposalInstructionRepository)
		private proposalInstructionRepository: IProposalInstructionRepository,
		@inject(DOMAIN_TYPES.DecodedInstructionRepository)
		private decodedInstructionRepository: IDecodedInstructionRepository,
		@inject(DOMAIN_TYPES.ProposalScoreRepository)
		private proposalScoreRepository: IProposalScoreRepository,
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.MultisigScoreRepository)
		private multisigScoreRepository: IMultisigScoreRepository,
		@inject(DOMAIN_TYPES.SignerRepository)
		private signerRepository: ISignerRepository,
		@inject(DOMAIN_TYPES.AIAnalysisService)
		private aiAnalysisService: IAIAnalysisService,
	) {
		super();
	}

	async execute(
		input: AnalyzeProposalAICommandInputDto,
	): Promise<AnalyzeProposalAICommandOutputDto> {
		const { proposalId } = input;

		this.logger.info("Analysing proposal with AI", { proposalId });

		const proposal = await this.proposalRepository.findById(proposalId);
		const proposalScore =
			await this.proposalScoreRepository.findByProposalId(proposalId);

		if (!proposal || !proposalScore) {
			this.logger.warning("AI analysis skipped: proposal or score missing", {
				proposalId,
				hasProposal: Boolean(proposal),
				hasScore: Boolean(proposalScore),
			});
			return { proposalId, aiAnalysis: null, recommendation: null };
		}

		const [instructions, multisig, multisigScore, signers] = await Promise.all([
			this.proposalInstructionRepository.findByProposalId(proposalId),
			this.multisigRepository.findById(proposal.multisigId),
			this.multisigScoreRepository.findByMultisigId(proposal.multisigId),
			this.signerRepository.findByMultisigId(proposal.multisigId),
		]);

		const decodedInstructions =
			await this.decodedInstructionRepository.findByProposalInstructionIds(
				instructions.map((ix) => ix.id),
			);

		const context: ProposalAnalysisContext = {
			proposalId,
			multisigId: proposal.multisigId,
			riskScore: proposalScore.riskScore,
			flags: proposalScore.flags,
			decodedInstructions,
			multisigContext: {
				overallScore: multisigScore?.overallScore ?? 0,
				threshold: multisig?.threshold ?? null,
				signerCount: signers.length,
				warnings: multisigScore?.warnings ?? [],
			},
		};

		try {
			const { aiAnalysis, recommendation } =
				await this.aiAnalysisService.analyzeProposal(context);
			await this.proposalScoreRepository.updateAIFields(proposalId, {
				aiAnalysis,
				recommendation,
			});
			this.logger.info("AI analysis stored", { proposalId, recommendation });
			return { proposalId, aiAnalysis, recommendation };
		} catch (error) {
			this.logger.error("AI analysis failed", {
				proposalId,
				error: error instanceof Error ? error.message : String(error),
			});
			return { proposalId, aiAnalysis: null, recommendation: null };
		}
	}
}

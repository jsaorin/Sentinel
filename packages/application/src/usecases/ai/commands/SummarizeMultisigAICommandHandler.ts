import {
	DOMAIN_TYPES,
	type IAIAnalysisService,
	type IMultisigRepository,
	type IMultisigScoreRepository,
	type IMultisigThreatExposureRepository,
	type IProposalScoreRepository,
	type ISignerRepository,
	type IThreatSignalRepository,
	type MultisigAnalysisContext,
	type MultisigThreatExposureSummary,
	severityForRole,
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
		@inject(DOMAIN_TYPES.MultisigThreatExposureRepository)
		private threatExposureRepository: IMultisigThreatExposureRepository,
		@inject(DOMAIN_TYPES.ThreatSignalRepository)
		private threatSignalRepository: IThreatSignalRepository,
	) {
		super();
	}

	async execute(
		input: SummarizeMultisigAICommandInputDto,
	): Promise<SummarizeMultisigAICommandOutputDto> {
		const { multisigId } = input;

		this.logger.info("Summarising multisig with AI", { multisigId });

		const [multisig, signers, score, proposalScores, threatExposures] =
			await Promise.all([
				this.multisigRepository.findById(multisigId),
				this.signerRepository.findByMultisigId(multisigId),
				this.multisigScoreRepository.findByMultisigId(multisigId),
				this.proposalScoreRepository.findByMultisigId(multisigId),
				this.threatExposureRepository.findByMultisigId(multisigId),
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

		const distinctSignalIds = Array.from(
			new Set(threatExposures.map((e) => e.threatSignalId)),
		);
		const signals = await Promise.all(
			distinctSignalIds.map((id) => this.threatSignalRepository.findById(id)),
		);
		const signalById = new Map<string, (typeof signals)[number]>(
			signals.map((s, i) => [distinctSignalIds[i], s]),
		);

		const threatExposureSummaries: MultisigThreatExposureSummary[] =
			threatExposures.map((exposure) => {
				const signal = signalById.get(exposure.threatSignalId) ?? null;
				return {
					signerAddress: exposure.signerAddress,
					role: exposure.role,
					kind: exposure.kind,
					severity: severityForRole(exposure.role),
					threatSeverity: signal?.severity ?? null,
					threatCategory: signal?.category ?? null,
					sourceLabel: signal?.source.label ?? null,
					summary: signal?.summary ?? null,
					capturedAt: (signal?.capturedAt ?? exposure.detectedAt).toISOString(),
				};
			});

		const context: MultisigAnalysisContext = {
			multisigId,
			address: multisig.address,
			threshold: multisig.threshold,
			configAuthority: multisig.configAuthority,
			signerCount: signers.length,
			overallScore: score.overallScore,
			warnings: score.warnings,
			recentProposals,
			threatExposures: threatExposureSummaries,
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

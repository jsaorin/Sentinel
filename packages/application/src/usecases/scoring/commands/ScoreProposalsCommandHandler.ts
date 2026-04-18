import {
	type DecodedInstruction,
	DOMAIN_TYPES,
	type IDecodedInstructionRepository,
	type IProposalInstructionRepository,
	type IProposalRepository,
	type IProposalScoreRepository,
	type IScoringService,
	ProposalScored,
	type UpsertProposalScoreInput,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { proposalScoredToIntegrationEvent } from "../../../mappers/events/proposalScoredToIntegration.js";
import type { IOutboxEventPublisher } from "../../../ports/IOutboxEventPublisher.js";
import { APPLICATION_TYPES } from "../../../types.js";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	ScoreProposalsCommandInputDto,
	ScoreProposalsCommandOutputDto,
} from "../dtos/ScoreProposalsCommandDto.js";

@injectable()
@injectFromBase()
export class ScoreProposalsCommandHandler extends BaseUseCase<
	ScoreProposalsCommandInputDto,
	ScoreProposalsCommandOutputDto
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
		@inject(DOMAIN_TYPES.ScoringService)
		private scoringService: IScoringService,
		@inject(APPLICATION_TYPES.OutboxEventPublisher)
		private eventPublisher: IOutboxEventPublisher,
	) {
		super();
	}

	async execute(
		input: ScoreProposalsCommandInputDto,
	): Promise<ScoreProposalsCommandOutputDto> {
		const { multisigId, proposals } = input;

		if (proposals.length === 0) {
			return { scored: 0, maxRiskScore: 0 };
		}

		this.logger.info("Scoring proposals", {
			multisigId,
			count: proposals.length,
		});

		const batchIds = new Set(proposals.map((p) => p.id));
		const decodedByProposal = await this.loadDecodedInstructions(
			proposals.map((p) => p.id),
		);
		const baselineHistorical = await this.buildBaselineHistoricalActions(
			multisigId,
			batchIds,
		);

		const sortedBatch = [...proposals].sort(
			(a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
		);

		const upsertInputs: UpsertProposalScoreInput[] = [];
		const cumulativeHistorical = new Set(baselineHistorical);
		let maxRiskScore = 0;

		for (const proposal of sortedBatch) {
			const decodedInstructions = decodedByProposal.get(proposal.id) ?? [];

			const data = this.scoringService.scoreProposal({
				proposalId: proposal.id,
				decodedInstructions,
				historicalActions: new Set(cumulativeHistorical),
			});

			if (data.riskScore > maxRiskScore) {
				maxRiskScore = data.riskScore;
			}

			upsertInputs.push({
				proposalId: proposal.id,
				riskScore: data.riskScore,
				flags: data.flags,
				summary: data.summary,
			});

			for (const ix of decodedInstructions) {
				if (!ix.isKnown) continue;
				cumulativeHistorical.add(`${ix.programName}::${ix.action}`);
			}
		}

		await this.proposalScoreRepository.upsertMany(upsertInputs);

		for (const score of upsertInputs) {
			const domainEvent = new ProposalScored(
				multisigId,
				score.proposalId,
				score.riskScore,
			);
			const { routingKey, event } =
				proposalScoredToIntegrationEvent(domainEvent);
			await this.eventPublisher.publish(event, { routingKey });
		}

		this.logger.info("Proposals scored", {
			multisigId,
			count: upsertInputs.length,
			maxRiskScore,
		});

		return {
			scored: upsertInputs.length,
			maxRiskScore,
		};
	}

	private async loadDecodedInstructions(
		proposalIds: string[],
	): Promise<Map<string, DecodedInstruction[]>> {
		const instructions =
			await this.proposalInstructionRepository.findByProposalIds(proposalIds);
		const instructionIds = instructions.map((ix) => ix.id);
		const decoded =
			await this.decodedInstructionRepository.findByProposalInstructionIds(
				instructionIds,
			);

		const instructionToProposal = new Map(
			instructions.map((ix) => [ix.id, ix.proposalId]),
		);
		const byProposal = new Map<string, DecodedInstruction[]>();

		for (const d of decoded) {
			const proposalId = instructionToProposal.get(d.proposalInstructionId);
			if (!proposalId) continue;
			const bucket = byProposal.get(proposalId) ?? [];
			bucket.push(d);
			byProposal.set(proposalId, bucket);
		}

		return byProposal;
	}

	private async buildBaselineHistoricalActions(
		multisigId: string,
		excludedProposalIds: Set<string>,
	): Promise<Set<string>> {
		const allProposals =
			await this.proposalRepository.findByMultisigId(multisigId);
		const otherProposalIds = allProposals
			.map((p) => p.id)
			.filter((id) => !excludedProposalIds.has(id));

		if (otherProposalIds.length === 0) return new Set();

		const decodedByOther = await this.loadDecodedInstructions(otherProposalIds);
		const historical = new Set<string>();

		for (const decoded of decodedByOther.values()) {
			for (const ix of decoded) {
				if (!ix.isKnown) continue;
				historical.add(`${ix.programName}::${ix.action}`);
			}
		}

		return historical;
	}
}

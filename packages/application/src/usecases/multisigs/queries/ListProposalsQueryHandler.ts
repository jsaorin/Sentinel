import {
	DOMAIN_TYPES,
	type IMultisigRepository,
	type IProposalInstructionRepository,
	type IProposalRepository,
	type IProposalScoreRepository,
	ResourceNotFoundError,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	ListProposalsQueryInputDto,
	ListProposalsQueryOutputDto,
} from "../dtos/ListProposalsQueryDto.js";

@injectable()
@injectFromBase()
export class ListProposalsQueryHandler extends BaseUseCase<
	ListProposalsQueryInputDto,
	ListProposalsQueryOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.ProposalRepository)
		private proposalRepository: IProposalRepository,
		@inject(DOMAIN_TYPES.ProposalInstructionRepository)
		private proposalInstructionRepository: IProposalInstructionRepository,
		@inject(DOMAIN_TYPES.ProposalScoreRepository)
		private proposalScoreRepository: IProposalScoreRepository,
	) {
		super();
	}

	async execute(
		input: ListProposalsQueryInputDto,
	): Promise<ListProposalsQueryOutputDto> {
		const multisig = await this.multisigRepository.findByAddress(input.address);

		if (!multisig) {
			throw new ResourceNotFoundError("Multisig", input.address);
		}

		const [proposals, total] = await Promise.all([
			this.proposalRepository.findByMultisigIdPaginated(multisig.id, {
				skip: (input.page - 1) * input.pageSize,
				take: input.pageSize,
			}),
			this.proposalRepository.countByMultisigId(multisig.id),
		]);

		const proposalIds = proposals.map((p) => p.id);
		const [instructions, scores] = await Promise.all([
			proposalIds.length > 0
				? this.proposalInstructionRepository.findByProposalIds(proposalIds)
				: Promise.resolve([]),
			proposalIds.length > 0
				? this.proposalScoreRepository.findByMultisigId(multisig.id)
				: Promise.resolve([]),
		]);

		const instructionsByProposal = new Map<string, typeof instructions>();
		for (const ix of instructions) {
			const list = instructionsByProposal.get(ix.proposalId) ?? [];
			list.push(ix);
			instructionsByProposal.set(ix.proposalId, list);
		}

		const scoresByProposal = new Map(
			scores.map((s) => [s.proposalId, s] as const),
		);

		return {
			proposals: proposals.map((p) => {
				const score = scoresByProposal.get(p.id);
				return {
					id: p.id,
					proposalIndex: p.proposalIndex,
					transactionIndex: p.transactionIndex,
					pda: p.pda,
					transactionPda: p.transactionPda,
					status: p.status,
					creator: p.creator,
					createdAt: p.createdAt,
					executedAt: p.executedAt,
					riskScore: score?.riskScore ?? null,
					summary: score?.summary ?? null,
					instructions: (instructionsByProposal.get(p.id) ?? []).map((ix) => ({
						instructionIndex: ix.instructionIndex,
						programId: ix.programId,
						data: ix.data,
						accounts: ix.accounts,
					})),
				};
			}),
			pagination: {
				page: input.page,
				pageSize: input.pageSize,
				total,
				totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
			},
		};
	}
}

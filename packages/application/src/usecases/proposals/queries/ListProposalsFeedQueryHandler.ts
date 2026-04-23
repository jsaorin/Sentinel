import {
	DOMAIN_TYPES,
	type IMultisigRepository,
	type IProposalRepository,
	type IProposalScoreRepository,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	ListProposalsFeedQueryInputDto,
	ListProposalsFeedQueryOutputDto,
} from "../dtos/ListProposalsFeedQueryDto.js";

@injectable()
@injectFromBase()
export class ListProposalsFeedQueryHandler extends BaseUseCase<
	ListProposalsFeedQueryInputDto,
	ListProposalsFeedQueryOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.ProposalRepository)
		private proposalRepository: IProposalRepository,
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.ProposalScoreRepository)
		private proposalScoreRepository: IProposalScoreRepository,
	) {
		super();
	}

	async execute(
		input: ListProposalsFeedQueryInputDto,
	): Promise<ListProposalsFeedQueryOutputDto> {
		const [proposals, total] = await Promise.all([
			this.proposalRepository.findAllPaginated({
				skip: (input.page - 1) * input.pageSize,
				take: input.pageSize,
				sortBy: input.sortBy,
				status: input.status,
			}),
			this.proposalRepository.countAll({ status: input.status }),
		]);

		const proposalIds = proposals.map((p) => p.id);
		const multisigIds = Array.from(new Set(proposals.map((p) => p.multisigId)));

		const [scores, multisigs] = await Promise.all([
			proposalIds.length > 0
				? this.proposalScoreRepository.findByProposalIds(proposalIds)
				: Promise.resolve([]),
			multisigIds.length > 0
				? this.multisigRepository.findByIds(multisigIds)
				: Promise.resolve([]),
		]);

		const scoresByProposal = new Map(
			scores.map((s) => [s.proposalId, s] as const),
		);

		const multisigsById = new Map(multisigs.map((m) => [m.id, m] as const));

		return {
			proposals: proposals.map((p) => {
				const score = scoresByProposal.get(p.id);
				const multisig = multisigsById.get(p.multisigId);
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
					multisig: {
						address: multisig?.address ?? "",
						label: multisig?.label ?? null,
					},
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

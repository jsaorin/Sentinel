import {
	DOMAIN_TYPES,
	ResourceNotFoundError,
	type IMultisigRepository,
	type IProposalInstructionRepository,
	type IProposalRepository,
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

		const proposals = await this.proposalRepository.findByMultisigId(
			multisig.id,
		);

		const proposalIds = proposals.map((p) => p.id);
		const instructions =
			proposalIds.length > 0
				? await this.proposalInstructionRepository.findByProposalIds(
						proposalIds,
					)
				: [];

		const instructionsByProposal = new Map<
			string,
			typeof instructions
		>();
		for (const ix of instructions) {
			const list = instructionsByProposal.get(ix.proposalId) ?? [];
			list.push(ix);
			instructionsByProposal.set(ix.proposalId, list);
		}

		return {
			proposals: proposals.map((p) => ({
				id: p.id,
				proposalIndex: p.proposalIndex,
				transactionIndex: p.transactionIndex,
				pda: p.pda,
				transactionPda: p.transactionPda,
				status: p.status,
				creator: p.creator,
				createdAt: p.createdAt,
				executedAt: p.executedAt,
				instructions: (
					instructionsByProposal.get(p.id) ?? []
				).map((ix) => ({
					instructionIndex: ix.instructionIndex,
					programId: ix.programId,
					data: ix.data,
					accounts: ix.accounts,
				})),
			})),
		};
	}
}

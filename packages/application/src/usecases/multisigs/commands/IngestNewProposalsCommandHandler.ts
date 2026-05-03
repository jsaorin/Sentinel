import {
	DOMAIN_TYPES,
	ProposalStatus as DomainProposalStatus,
	type IProposalInstructionRepository,
	type IProposalRepository,
	type ISquadsService,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { APPLICATION_TYPES } from "../../../types.js";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type { DecodeInstructionsCommandHandler } from "../../instructions/commands/DecodeInstructionsCommandHandler.js";
import type { ScoreProposalsCommandHandler } from "../../scoring/commands/ScoreProposalsCommandHandler.js";
import type {
	IngestNewProposalsCommandInputDto,
	IngestNewProposalsCommandOutputDto,
} from "../dtos/IngestNewProposalsCommandDto.js";

const SQUADS_STATUS_MAP: Record<string, DomainProposalStatus> = {
	DRAFT: DomainProposalStatus.DRAFT,
	ACTIVE: DomainProposalStatus.ACTIVE,
	APPROVED: DomainProposalStatus.APPROVED,
	REJECTED: DomainProposalStatus.REJECTED,
	EXECUTING: DomainProposalStatus.EXECUTED,
	EXECUTED: DomainProposalStatus.EXECUTED,
	CANCELLED: DomainProposalStatus.CANCELLED,
};

@injectable()
@injectFromBase()
export class IngestNewProposalsCommandHandler extends BaseUseCase<
	IngestNewProposalsCommandInputDto,
	IngestNewProposalsCommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.ProposalRepository)
		private proposalRepository: IProposalRepository,
		@inject(DOMAIN_TYPES.ProposalInstructionRepository)
		private proposalInstructionRepository: IProposalInstructionRepository,
		@inject(DOMAIN_TYPES.SquadsService)
		private squadsService: ISquadsService,
		@inject(APPLICATION_TYPES.DecodeInstructionsCommandHandler)
		private decodeInstructionsHandler: DecodeInstructionsCommandHandler,
		@inject(APPLICATION_TYPES.ScoreProposalsCommandHandler)
		private scoreProposalsHandler: ScoreProposalsCommandHandler,
	) {
		super();
	}

	async execute(
		input: IngestNewProposalsCommandInputDto,
	): Promise<IngestNewProposalsCommandOutputDto> {
		const { multisigId, address, transactionIndex, slot } = input;

		const lastProposal =
			await this.proposalRepository.findLatestByMultisigId(multisigId);
		const startIndex = lastProposal ? lastProposal.proposalIndex + 1 : 1;

		if (startIndex > transactionIndex) {
			return { newProposals: [] };
		}

		const proposalData = await this.squadsService.getProposals(
			address,
			transactionIndex,
			startIndex,
			slot,
		);

		if (proposalData.length === 0) {
			return { newProposals: [] };
		}

		const newProposals = await this.proposalRepository.createMany(
			proposalData.map((p) => ({
				multisigId,
				proposalIndex: p.proposalIndex,
				transactionIndex: p.transactionIndex,
				pda: p.pda,
				transactionPda: p.transactionPda,
				status: SQUADS_STATUS_MAP[p.status] ?? DomainProposalStatus.DRAFT,
				creator: p.creator,
				createdAt: p.createdAt,
				executedAt: p.executedAt,
				approvers: p.approvers,
				rejecters: p.rejecters,
				cancellers: p.cancellers,
			})),
		);

		this.logger.info("New proposals ingested", {
			multisigId,
			count: newProposals.length,
			startIndex,
			transactionIndex,
		});

		const transactionPdas = newProposals.map((p) => p.transactionPda);
		const vaultTxData =
			await this.squadsService.getVaultTransactionInstructions(
				transactionPdas,
				slot,
			);

		const pdaToProposalId = new Map(
			newProposals.map((p) => [p.transactionPda, p.id]),
		);

		const allInstructions = vaultTxData.flatMap((vtx) => {
			const proposalId = pdaToProposalId.get(vtx.transactionPda);
			if (!proposalId) return [];
			return vtx.instructions.map((ix) => ({
				proposalId,
				instructionIndex: ix.instructionIndex,
				programId: ix.programId,
				data: ix.data,
				accounts: ix.accounts,
			}));
		});

		if (allInstructions.length > 0) {
			const savedInstructions =
				await this.proposalInstructionRepository.createMany(allInstructions);

			await this.decodeInstructionsHandler.execute({
				instructions: savedInstructions,
			});
		}

		await this.scoreProposalsHandler.execute({
			multisigId,
			proposals: newProposals,
		});

		return { newProposals };
	}
}

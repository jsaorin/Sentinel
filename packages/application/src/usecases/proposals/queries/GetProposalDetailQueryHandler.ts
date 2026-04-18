import {
	DOMAIN_TYPES,
	type IDecodedInstructionRepository,
	type IMultisigRepository,
	type IProposalInstructionRepository,
	type IProposalRepository,
	type IProposalScoreRepository,
	type ISignerRepository,
	ResourceNotFoundError,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	GetProposalDetailQueryInputDto,
	GetProposalDetailQueryOutputDto,
	GetProposalDetailQueryOutputInstruction,
	GetProposalDetailQueryOutputSigner,
} from "../dtos/GetProposalDetailQueryDto.js";

@injectable()
@injectFromBase()
export class GetProposalDetailQueryHandler extends BaseUseCase<
	GetProposalDetailQueryInputDto,
	GetProposalDetailQueryOutputDto
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
		@inject(DOMAIN_TYPES.SignerRepository)
		private signerRepository: ISignerRepository,
	) {
		super();
	}

	async execute(
		input: GetProposalDetailQueryInputDto,
	): Promise<GetProposalDetailQueryOutputDto> {
		const { proposalId } = input;

		const proposal = await this.proposalRepository.findById(proposalId);
		if (!proposal) {
			throw new ResourceNotFoundError("Proposal", proposalId);
		}

		const multisig = await this.multisigRepository.findById(proposal.multisigId);
		if (!multisig) {
			throw new ResourceNotFoundError("Multisig", proposal.multisigId);
		}

		const [signers, multisigProposals, rawInstructions, proposalScore] =
			await Promise.all([
				this.signerRepository.findByMultisigId(multisig.id),
				this.proposalRepository.findByMultisigId(multisig.id),
				this.proposalInstructionRepository.findByProposalId(proposalId),
				this.proposalScoreRepository.findByProposalId(proposalId),
			]);

		const decodedByInstructionId = await this.loadDecodedByInstructionId(
			rawInstructions.map((ix) => ix.id),
		);

		const totalProposalsInMultisig = multisigProposals.length;

		const signerItems: GetProposalDetailQueryOutputSigner[] = signers.map(
			(signer) => ({ signer, totalProposalsInMultisig }),
		);

		const instructionItems: GetProposalDetailQueryOutputInstruction[] =
			rawInstructions
				.slice()
				.sort((a, b) => a.instructionIndex - b.instructionIndex)
				.map((instruction) => ({
					instruction,
					decoded: decodedByInstructionId.get(instruction.id) ?? null,
				}));

		return {
			id: proposal.id,
			proposalIndex: proposal.proposalIndex,
			transactionIndex: proposal.transactionIndex,
			status: proposal.status,
			creator: proposal.creator,
			createdAt: proposal.createdAt,
			executedAt: proposal.executedAt,

			multisig: {
				address: multisig.address,
				label: multisig.label,
				threshold: multisig.threshold,
				totalSigners: signers.length,
			},

			scoring: proposalScore
				? {
						riskScore: proposalScore.riskScore,
						flags: proposalScore.flags,
						summary: proposalScore.summary,
						calculatedAt: proposalScore.calculatedAt,
					}
				: null,

			ai:
				proposalScore?.aiAnalysis && proposalScore?.recommendation
					? {
							analysis: proposalScore.aiAnalysis,
							recommendation: proposalScore.recommendation,
						}
					: null,

			signers: signerItems,
			instructions: instructionItems,
		};
	}

	private async loadDecodedByInstructionId(instructionIds: string[]) {
		if (instructionIds.length === 0)
			return new Map<string, import("@sentinel/domain").DecodedInstruction>();
		const decoded =
			await this.decodedInstructionRepository.findByProposalInstructionIds(
				instructionIds,
			);
		return new Map(
			decoded.map((d) => [d.proposalInstructionId, d] as const),
		);
	}
}

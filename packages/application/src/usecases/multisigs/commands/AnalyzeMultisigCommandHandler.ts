import {
	DOMAIN_TYPES,
	ProposalStatus as DomainProposalStatus,
	type IMultisigRepository,
	type IProposalRepository,
	type ISignerRepository,
	type ISquadsService,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	AnalyzeMultisigCommandInputDto,
	AnalyzeMultisigCommandOutputDto,
} from "../dtos/AnalyzeMultisigCommandDto.js";

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
export class AnalyzeMultisigCommandHandler extends BaseUseCase<
	AnalyzeMultisigCommandInputDto,
	AnalyzeMultisigCommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.SignerRepository)
		private signerRepository: ISignerRepository,
		@inject(DOMAIN_TYPES.ProposalRepository)
		private proposalRepository: IProposalRepository,
		@inject(DOMAIN_TYPES.SquadsService)
		private squadsService: ISquadsService,
	) {
		super();
	}

	async execute(
		input: AnalyzeMultisigCommandInputDto,
	): Promise<AnalyzeMultisigCommandOutputDto> {
		const { multisigId, address } = input;

		this.logger.info("Analyzing multisig", { multisigId, address });

		// 1. Fetch on-chain multisig data
		const accountData =
			await this.squadsService.getMultisigAccountData(address);

		// 2. Update multisig with threshold and configAuthority
		await this.multisigRepository.update(multisigId, {
			threshold: accountData.threshold,
			configAuthority: accountData.configAuthority,
		});

		// 3. Replace signers (delete + recreate for idempotency — members can change)
		await this.signerRepository.deleteByMultisigId(multisigId);
		const signers = await this.signerRepository.createMany(
			accountData.members.map((member) => ({
				address: member.address,
				multisigId,
				permissions: member.permissions,
			})),
		);

		this.logger.info("Signers stored", {
			multisigId,
			count: signers.length,
		});

		// 4. Incremental proposal fetch — only get new proposals
		const lastProposal =
			await this.proposalRepository.findLatestByMultisigId(multisigId);
		const startIndex = lastProposal
			? lastProposal.proposalIndex + 1
			: 1;

		const proposalData = await this.squadsService.getProposals(
			address,
			accountData.transactionIndex,
			startIndex,
		);

		let newProposalsCount = 0;
		if (proposalData.length > 0) {
			await this.proposalRepository.createMany(
				proposalData.map((p) => ({
					multisigId,
					proposalIndex: p.proposalIndex,
					transactionIndex: p.transactionIndex,
					pda: p.pda,
					transactionPda: p.transactionPda,
					status:
						SQUADS_STATUS_MAP[p.status] ??
						DomainProposalStatus.DRAFT,
					creator: p.creator,
					createdAt: p.createdAt,
					executedAt: p.executedAt,
				})),
			);
			newProposalsCount = proposalData.length;
		}

		this.logger.info("Proposals stored", {
			multisigId,
			newCount: newProposalsCount,
			startIndex,
			transactionIndex: accountData.transactionIndex,
		});

		// 5. Get total proposals count
		const allProposals =
			await this.proposalRepository.findByMultisigId(multisigId);

		return {
			multisigId,
			threshold: accountData.threshold,
			signersCount: signers.length,
			proposalsCount: allProposals.length,
		};
	}
}

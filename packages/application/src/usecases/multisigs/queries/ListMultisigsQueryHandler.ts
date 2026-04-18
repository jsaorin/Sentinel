import {
	DOMAIN_TYPES,
	type IMultisigRepository,
	type IMultisigScoreRepository,
	type IProposalRepository,
	type ISignerRepository,
	ProposalStatus,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	ListMultisigsQueryInputDto,
	ListMultisigsQueryOutputDto,
	ListMultisigsQueryOutputItem,
} from "../dtos/ListMultisigsQueryDto.js";

@injectable()
@injectFromBase()
export class ListMultisigsQueryHandler extends BaseUseCase<
	ListMultisigsQueryInputDto,
	ListMultisigsQueryOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.SignerRepository)
		private signerRepository: ISignerRepository,
		@inject(DOMAIN_TYPES.ProposalRepository)
		private proposalRepository: IProposalRepository,
		@inject(DOMAIN_TYPES.MultisigScoreRepository)
		private multisigScoreRepository: IMultisigScoreRepository,
	) {
		super();
	}

	async execute(
		_input: ListMultisigsQueryInputDto,
	): Promise<ListMultisigsQueryOutputDto> {
		const multisigs = await this.multisigRepository.findAll();

		const items: ListMultisigsQueryOutputItem[] = await Promise.all(
			multisigs.map(async (multisig) => {
				const [signers, proposals, score] = await Promise.all([
					this.signerRepository.findByMultisigId(multisig.id),
					this.proposalRepository.findByMultisigId(multisig.id),
					this.multisigScoreRepository.findByMultisigId(multisig.id),
				]);

				const activeProposals = proposals.filter(
					(p) => p.status === ProposalStatus.ACTIVE,
				).length;

				const lastActivity = proposals.reduce<Date | null>((latest, p) => {
					if (!latest) return p.createdAt;
					return p.createdAt.getTime() > latest.getTime()
						? p.createdAt
						: latest;
				}, null);

				return {
					id: multisig.id,
					address: multisig.address,
					label: multisig.label,
					threshold: multisig.threshold,
					totalSigners: signers.length,
					healthScore: score?.overallScore ?? null,
					activeProposals,
					lastActivity,
					createdAt: multisig.createdAt,
				};
			}),
		);

		return { multisigs: items };
	}
}

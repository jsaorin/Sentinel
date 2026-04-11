import {
	DOMAIN_TYPES,
	ResourceNotFoundError,
	type IMultisigRepository,
	type ISignerRepository,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	ListSignersQueryInputDto,
	ListSignersQueryOutputDto,
} from "../dtos/ListSignersQueryDto.js";

@injectable()
@injectFromBase()
export class ListSignersQueryHandler extends BaseUseCase<
	ListSignersQueryInputDto,
	ListSignersQueryOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.SignerRepository)
		private signerRepository: ISignerRepository,
	) {
		super();
	}

	async execute(
		input: ListSignersQueryInputDto,
	): Promise<ListSignersQueryOutputDto> {
		const multisig = await this.multisigRepository.findByAddress(input.address);

		if (!multisig) {
			throw new ResourceNotFoundError("Multisig", input.address);
		}

		const signers = await this.signerRepository.findByMultisigId(multisig.id);

		return {
			signers: signers.map((s) => ({
				id: s.id,
				address: s.address,
				permissions: s.permissions,
			})),
		};
	}
}

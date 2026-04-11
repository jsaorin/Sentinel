import {
	DOMAIN_TYPES,
	ResourceNotFoundError,
	type IMultisigRepository,
	type IVaultRepository,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	GetMultisigQueryInputDto,
	GetMultisigQueryOutputDto,
} from "../dtos/GetMultisigQueryDto.js";

@injectable()
@injectFromBase()
export class GetMultisigQueryHandler extends BaseUseCase<
	GetMultisigQueryInputDto,
	GetMultisigQueryOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.VaultRepository)
		private vaultRepository: IVaultRepository,
	) {
		super();
	}

	async execute(
		input: GetMultisigQueryInputDto,
	): Promise<GetMultisigQueryOutputDto> {
		const multisig = await this.multisigRepository.findByAddress(input.address);

		if (!multisig) {
			throw new ResourceNotFoundError("Multisig", input.address);
		}

		const vaults = await this.vaultRepository.findByMultisigId(multisig.id);

		return {
			id: multisig.id,
			address: multisig.address,
			label: multisig.label,
			threshold: multisig.threshold,
			configAuthority: multisig.configAuthority,
			vaults: vaults.map((v) => ({
				vaultIndex: v.vaultIndex,
				pda: v.pda,
			})),
			createdAt: multisig.createdAt,
		};
	}
}

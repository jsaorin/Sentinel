import {
	DOMAIN_TYPES,
	type IMultisigRepository,
	type IMultisigScoreRepository,
	type ISignerRepository,
	type IVaultRepository,
	ResourceNotFoundError,
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
		@inject(DOMAIN_TYPES.SignerRepository)
		private signerRepository: ISignerRepository,
		@inject(DOMAIN_TYPES.MultisigScoreRepository)
		private multisigScoreRepository: IMultisigScoreRepository,
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

		const [vaults, signers, healthScore] = await Promise.all([
			this.vaultRepository.findByMultisigId(multisig.id),
			this.signerRepository.findByMultisigId(multisig.id),
			this.multisigScoreRepository.findByMultisigId(multisig.id),
		]);

		return {
			id: multisig.id,
			address: multisig.address,
			label: multisig.label,
			threshold: multisig.threshold,
			configAuthority: multisig.configAuthority,
			totalSigners: signers.length,
			vaults: vaults.map((v) => ({
				vaultIndex: v.vaultIndex,
				pda: v.pda,
			})),
			healthScore,
			createdAt: multisig.createdAt,
		};
	}
}

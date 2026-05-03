import {
	DOMAIN_TYPES,
	type IMultisigRepository,
	type INonceAccountRepository,
	type ISignerRepository,
	ResourceNotFoundError,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	ListNonceWarningsQueryInputDto,
	ListNonceWarningsQueryOutputDto,
	NonceWarningOutputItem,
} from "../dtos/ListNonceWarningsQueryDto.js";

@injectable()
@injectFromBase()
export class ListNonceWarningsQueryHandler extends BaseUseCase<
	ListNonceWarningsQueryInputDto,
	ListNonceWarningsQueryOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.SignerRepository)
		private signerRepository: ISignerRepository,
		@inject(DOMAIN_TYPES.NonceAccountRepository)
		private nonceRepository: INonceAccountRepository,
	) {
		super();
	}

	async execute(
		input: ListNonceWarningsQueryInputDto,
	): Promise<ListNonceWarningsQueryOutputDto> {
		const multisig = await this.multisigRepository.findByAddress(
			input.multisigAddress,
		);
		if (!multisig) {
			throw new ResourceNotFoundError("Multisig", input.multisigAddress);
		}

		const [nonces, signers] = await Promise.all([
			this.nonceRepository.findByMultisigId(multisig.id),
			this.signerRepository.findByMultisigId(multisig.id),
		]);
		const signerById = new Map(signers.map((s) => [s.id, s.address]));

		const warnings: NonceWarningOutputItem[] = nonces.map((n) => ({
			id: n.id,
			signerAddress: signerById.get(n.signerId) ?? n.authority,
			nonceAddress: n.address,
			authority: n.authority,
			fundedBy: n.fundedBy,
			externallyFunded: n.externallyFunded,
			severity: n.externallyFunded ? "CRITICAL" : "WARNING",
			detectedAt: n.detectedAt,
		}));

		return { warnings };
	}
}

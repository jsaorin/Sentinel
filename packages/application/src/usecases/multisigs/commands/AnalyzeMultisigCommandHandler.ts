import {
	DOMAIN_TYPES,
	type IMultisigRepository,
	type INonceAccountSubscriber,
	type ISignerRepository,
	type ISquadsService,
	type IVaultRepository,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { APPLICATION_TYPES } from "../../../types.js";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type { ScoreMultisigHealthCommandHandler } from "../../scoring/commands/ScoreMultisigHealthCommandHandler.js";
import type {
	AnalyzeMultisigCommandInputDto,
	AnalyzeMultisigCommandOutputDto,
} from "../dtos/AnalyzeMultisigCommandDto.js";
import type { IngestNewProposalsCommandHandler } from "./IngestNewProposalsCommandHandler.js";

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
		@inject(DOMAIN_TYPES.SquadsService)
		private squadsService: ISquadsService,
		@inject(DOMAIN_TYPES.VaultRepository)
		private vaultRepository: IVaultRepository,
		@inject(DOMAIN_TYPES.NonceAccountSubscriber)
		private nonceAccountSubscriber: INonceAccountSubscriber,
		@inject(APPLICATION_TYPES.IngestNewProposalsCommandHandler)
		private ingestNewProposalsHandler: IngestNewProposalsCommandHandler,
		@inject(APPLICATION_TYPES.ScoreMultisigHealthCommandHandler)
		private scoreMultisigHealthHandler: ScoreMultisigHealthCommandHandler,
	) {
		super();
	}

	async execute(
		input: AnalyzeMultisigCommandInputDto,
	): Promise<AnalyzeMultisigCommandOutputDto> {
		const { multisigId, address } = input;

		this.logger.info("Analyzing multisig", { multisigId, address });

		const accountData =
			await this.squadsService.getMultisigAccountData(address);

		await this.multisigRepository.update(multisigId, {
			threshold: accountData.threshold,
			configAuthority: accountData.configAuthority,
		});

		await this.vaultRepository.upsert({
			multisigId,
			vaultIndex: 0,
			pda: accountData.vaultPda,
		});

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

		for (const signer of signers) {
			await this.nonceAccountSubscriber.addAuthority(signer.address);
		}

		const { newProposals } = await this.ingestNewProposalsHandler.execute({
			multisigId,
			address,
			transactionIndex: accountData.transactionIndex,
		});

		await this.scoreMultisigHealthHandler.execute({ multisigId });

		return {
			multisigId,
			threshold: accountData.threshold,
			signersCount: signers.length,
			proposalsCount: newProposals.length,
		};
	}
}

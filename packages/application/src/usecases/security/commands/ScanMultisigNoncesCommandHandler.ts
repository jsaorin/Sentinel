import {
	DOMAIN_TYPES,
	type IMultisigRepository,
	type ISignerRepository,
	ResourceNotFoundError,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { APPLICATION_TYPES } from "../../../types.js";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type { ScoreMultisigHealthCommandHandler } from "../../scoring/commands/ScoreMultisigHealthCommandHandler.js";
import type {
	ScanMultisigNoncesCommandInputDto,
	ScanMultisigNoncesCommandOutputDto,
} from "../dtos/ScanMultisigNoncesCommandDto.js";
import type { ScanSignerNoncesCommandHandler } from "./ScanSignerNoncesCommandHandler.js";

@injectable()
@injectFromBase()
export class ScanMultisigNoncesCommandHandler extends BaseUseCase<
	ScanMultisigNoncesCommandInputDto,
	ScanMultisigNoncesCommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.SignerRepository)
		private signerRepository: ISignerRepository,
		@inject(APPLICATION_TYPES.ScanSignerNoncesCommandHandler)
		private scanSignerNoncesHandler: ScanSignerNoncesCommandHandler,
		@inject(APPLICATION_TYPES.ScoreMultisigHealthCommandHandler)
		private scoreMultisigHealthHandler: ScoreMultisigHealthCommandHandler,
	) {
		super();
	}

	async execute(
		input: ScanMultisigNoncesCommandInputDto,
	): Promise<ScanMultisigNoncesCommandOutputDto> {
		const startedAt = Date.now();
		const multisig = await this.multisigRepository.findByAddress(
			input.multisigAddress,
		);
		if (!multisig) {
			throw new ResourceNotFoundError("Multisig", input.multisigAddress);
		}

		const signers = await this.signerRepository.findByMultisigId(multisig.id);
		this.logger.info("nonce:scan:requested", {
			multisigId: multisig.id,
			multisigAddress: multisig.address,
			signerCount: signers.length,
		});

		let totalNoncesFound = 0;
		let newNoncesFound = 0;
		for (const signer of signers) {
			const result = await this.scanSignerNoncesHandler.execute({
				multisigId: multisig.id,
				signerId: signer.id,
				signerAddress: signer.address,
			});
			totalNoncesFound += result.totalNonceCount;
			newNoncesFound += result.newNonceCount;
		}

		// Re-score multisig health if anything new was detected so the new
		// nonce-related warnings flow into multisig_score immediately.
		if (newNoncesFound > 0) {
			try {
				await this.scoreMultisigHealthHandler.execute({
					multisigId: multisig.id,
				});
			} catch (err) {
				this.logger.warning("nonce:scan:rescore-failed", {
					multisigId: multisig.id,
					err: (err as Error).message,
				});
			}
		}

		const durationMs = Date.now() - startedAt;
		this.logger.info("nonce:scan:done", {
			multisigId: multisig.id,
			signerCount: signers.length,
			totalNoncesFound,
			newNoncesFound,
			durationMs,
		});

		return {
			multisigAddress: multisig.address,
			signerCount: signers.length,
			totalNoncesFound,
			newNoncesFound,
			durationMs,
		};
	}
}

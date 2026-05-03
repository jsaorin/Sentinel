import { DOMAIN_TYPES, type IMultisigRepository } from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { APPLICATION_TYPES } from "../../../types.js";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	ScanAllMultisigsNoncesCommandInputDto,
	ScanAllMultisigsNoncesCommandOutputDto,
} from "../dtos/ScanAllMultisigsNoncesCommandDto.js";
import type { ScanMultisigNoncesCommandHandler } from "./ScanMultisigNoncesCommandHandler.js";

@injectable()
@injectFromBase()
export class ScanAllMultisigsNoncesCommandHandler extends BaseUseCase<
	ScanAllMultisigsNoncesCommandInputDto,
	ScanAllMultisigsNoncesCommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(APPLICATION_TYPES.ScanMultisigNoncesCommandHandler)
		private scanMultisigNoncesHandler: ScanMultisigNoncesCommandHandler,
	) {
		super();
	}

	async execute(
		_input: ScanAllMultisigsNoncesCommandInputDto,
	): Promise<ScanAllMultisigsNoncesCommandOutputDto> {
		const startedAt = Date.now();
		const multisigs = await this.multisigRepository.findAll();

		let signerCount = 0;
		let totalNoncesFound = 0;
		let newNoncesFound = 0;
		for (const m of multisigs) {
			const result = await this.scanMultisigNoncesHandler.execute({
				multisigAddress: m.address,
			});
			signerCount += result.signerCount;
			totalNoncesFound += result.totalNoncesFound;
			newNoncesFound += result.newNoncesFound;
		}

		const durationMs = Date.now() - startedAt;
		this.logger.info("nonce:scan:all-done", {
			scannedMultisigCount: multisigs.length,
			signerCount,
			totalNoncesFound,
			newNoncesFound,
			durationMs,
		});

		return {
			scannedMultisigCount: multisigs.length,
			signerCount,
			totalNoncesFound,
			newNoncesFound,
			durationMs,
		};
	}
}

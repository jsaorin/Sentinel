import {
	DOMAIN_TYPES,
	type IMultisigThreatExposureRepository,
	type ISignerRepository,
	type IThreatSignalRepository,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	LinkThreatEntityToMultisigsCommandInputDto,
	LinkThreatEntityToMultisigsCommandOutputDto,
} from "../dtos/LinkThreatEntityToMultisigsCommandDto.js";

@injectable()
@injectFromBase()
export class LinkThreatEntityToMultisigsCommandHandler extends BaseUseCase<
	LinkThreatEntityToMultisigsCommandInputDto,
	LinkThreatEntityToMultisigsCommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.ThreatSignalRepository)
		private threatSignalRepository: IThreatSignalRepository,
		@inject(DOMAIN_TYPES.SignerRepository)
		private signerRepository: ISignerRepository,
		@inject(DOMAIN_TYPES.MultisigThreatExposureRepository)
		private exposureRepository: IMultisigThreatExposureRepository,
	) {
		super();
	}

	async execute(
		input: LinkThreatEntityToMultisigsCommandInputDto,
	): Promise<LinkThreatEntityToMultisigsCommandOutputDto> {
		const { threatSignalId, threatSignalEntityId } = input;

		const signal = await this.threatSignalRepository.findById(threatSignalId);
		if (!signal) {
			this.logger.warning("threat-link:signal-not-found", { threatSignalId });
			return {
				affectedMultisigIds: [],
				skipped: true,
				skippedReason: "signal-not-found",
			};
		}

		const entity = signal.entities.find((e) => e.id === threatSignalEntityId);
		if (!entity) {
			this.logger.warning("threat-link:entity-not-found", {
				threatSignalId,
				threatSignalEntityId,
			});
			return {
				affectedMultisigIds: [],
				skipped: true,
				skippedReason: "entity-not-found",
			};
		}

		if (entity.kind !== "wallet") {
			this.logger.info("threat-link:skipped-non-wallet-entity", {
				threatSignalId,
				threatSignalEntityId,
				kind: entity.kind,
			});
			return {
				affectedMultisigIds: [],
				skipped: true,
				skippedReason: "non-wallet-entity",
			};
		}

		const matchedSigners = await this.signerRepository.findByAddress(
			entity.address,
		);
		if (matchedSigners.length === 0) {
			this.logger.info("threat-link:no-signer-match", {
				threatSignalId,
				threatSignalEntityId,
				address: entity.address,
			});
			return {
				affectedMultisigIds: [],
				skipped: false,
			};
		}

		const detectedAt = new Date();
		const affected = new Set<string>();
		for (const signer of matchedSigners) {
			await this.exposureRepository.upsert({
				multisigId: signer.multisigId,
				signerId: signer.id,
				signerAddress: signer.address,
				threatSignalId,
				threatSignalEntityId,
				kind: entity.kind,
				role: entity.role,
				detectedAt,
			});
			affected.add(signer.multisigId);
		}

		const affectedMultisigIds = Array.from(affected);
		this.logger.info("threat-link:exposures-recorded", {
			threatSignalId,
			threatSignalEntityId,
			address: entity.address,
			role: entity.role,
			affectedMultisigCount: affectedMultisigIds.length,
		});

		return {
			affectedMultisigIds,
			skipped: false,
		};
	}
}

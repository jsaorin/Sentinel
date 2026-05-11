import type { MultisigThreatExposure } from "@sentinel/domain";
import type {
	IMultisigThreatExposureRepository,
	UpsertMultisigThreatExposureInput,
} from "@sentinel/domain/repositories";
import { injectable } from "inversify";
import { mapPrismaMultisigThreatExposureToDomain } from "../mappers/MultisigThreatExposureMapper.js";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";

@injectable()
export class MultisigThreatExposureRepository
	implements IMultisigThreatExposureRepository
{
	private get prisma() {
		return getPrismaClient();
	}

	async upsert(
		input: UpsertMultisigThreatExposureInput,
	): Promise<MultisigThreatExposure> {
		const record = await this.prisma.multisigThreatExposure.upsert({
			where: {
				multisigId_threatSignalEntityId: {
					multisigId: input.multisigId,
					threatSignalEntityId: input.threatSignalEntityId,
				},
			},
			create: {
				multisigId: input.multisigId,
				signerId: input.signerId,
				signerAddress: input.signerAddress,
				threatSignalId: input.threatSignalId,
				threatSignalEntityId: input.threatSignalEntityId,
				kind: input.kind,
				role: input.role,
				detectedAt: input.detectedAt,
			},
			update: {
				signerId: input.signerId,
				signerAddress: input.signerAddress,
				kind: input.kind,
				role: input.role,
				detectedAt: input.detectedAt,
			},
		});
		return mapPrismaMultisigThreatExposureToDomain(record);
	}

	async findByMultisigId(
		multisigId: string,
	): Promise<MultisigThreatExposure[]> {
		const records = await this.prisma.multisigThreatExposure.findMany({
			where: { multisigId },
			orderBy: { detectedAt: "desc" },
		});
		return records.map(mapPrismaMultisigThreatExposureToDomain);
	}
}

import { MultisigThreatExposure } from "@sentinel/domain";
import type { MultisigThreatExposure as PrismaMultisigThreatExposure } from "../../generated/client/index.js";

export function mapPrismaMultisigThreatExposureToDomain(
	record: PrismaMultisigThreatExposure,
): MultisigThreatExposure {
	return new MultisigThreatExposure({
		id: record.id,
		multisigId: record.multisigId,
		signerId: record.signerId,
		signerAddress: record.signerAddress,
		threatSignalId: record.threatSignalId,
		threatSignalEntityId: record.threatSignalEntityId,
		kind: record.kind,
		role: record.role,
		detectedAt: record.detectedAt,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
	});
}

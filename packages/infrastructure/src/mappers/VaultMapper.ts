import type { Vault as PrismaVault } from "../../generated/client/index.js";
import { Vault } from "@sentinel/domain";

export function mapPrismaVaultToDomain(record: PrismaVault): Vault {
	return new Vault({
		id: record.id,
		multisigId: record.multisigId,
		vaultIndex: record.vaultIndex,
		pda: record.pda,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
	});
}

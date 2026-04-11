import type { Vault } from "@sentinel/domain";
import type { IVaultRepository } from "@sentinel/domain/repositories";
import { injectable } from "inversify";
import { mapPrismaVaultToDomain } from "../mappers/VaultMapper.js";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";

@injectable()
export class VaultRepository implements IVaultRepository {
	private get prisma() {
		return getPrismaClient();
	}

	async findByMultisigId(multisigId: string): Promise<Vault[]> {
		const records = await this.prisma.vault.findMany({
			where: { multisigId },
		});
		return records.map(mapPrismaVaultToDomain);
	}

	async upsert(data: {
		multisigId: string;
		vaultIndex: number;
		pda: string;
	}): Promise<Vault> {
		const record = await this.prisma.vault.upsert({
			where: {
				multisigId_vaultIndex: {
					multisigId: data.multisigId,
					vaultIndex: data.vaultIndex,
				},
			},
			update: {
				pda: data.pda,
			},
			create: {
				multisigId: data.multisigId,
				vaultIndex: data.vaultIndex,
				pda: data.pda,
			},
		});
		return mapPrismaVaultToDomain(record);
	}
}

import type { NonceAccount } from "@sentinel/domain";
import type {
	CreateNonceAccountInput,
	INonceAccountRepository,
} from "@sentinel/domain/repositories";
import { injectable } from "inversify";
import { mapPrismaNonceAccountToDomain } from "../mappers/NonceAccountMapper.js";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";

@injectable()
export class NonceAccountRepository implements INonceAccountRepository {
	private get prisma() {
		return getPrismaClient();
	}

	async findByMultisigId(multisigId: string): Promise<NonceAccount[]> {
		const records = await this.prisma.nonceAccount.findMany({
			where: { multisigId },
			orderBy: { detectedAt: "desc" },
		});
		return records.map(mapPrismaNonceAccountToDomain);
	}

	async findExistingAddresses(addresses: string[]): Promise<Set<string>> {
		if (addresses.length === 0) return new Set();
		const records = await this.prisma.nonceAccount.findMany({
			where: { address: { in: addresses } },
			select: { address: true },
		});
		return new Set(records.map((r) => r.address));
	}

	async createMany(items: CreateNonceAccountInput[]): Promise<NonceAccount[]> {
		const results: NonceAccount[] = [];
		for (const item of items) {
			const record = await this.prisma.nonceAccount.create({
				data: {
					address: item.address,
					authority: item.authority,
					fundedBy: item.fundedBy,
					multisigId: item.multisigId,
					signerId: item.signerId,
					externallyFunded: item.externallyFunded,
				},
			});
			results.push(mapPrismaNonceAccountToDomain(record));
		}
		return results;
	}
}

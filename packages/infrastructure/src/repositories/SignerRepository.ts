import type { Signer } from "@sentinel/domain";
import type { ISignerRepository } from "@sentinel/domain/repositories";
import { injectable } from "inversify";
import { mapPrismaSignerToDomain } from "../mappers/SignerMapper.js";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";

@injectable()
export class SignerRepository implements ISignerRepository {
	private get prisma() {
		return getPrismaClient();
	}

	async findByMultisigId(multisigId: string): Promise<Signer[]> {
		const records = await this.prisma.signer.findMany({
			where: { multisigId },
		});
		return records.map(mapPrismaSignerToDomain);
	}

	async createMany(
		signers: Array<{
			address: string;
			multisigId: string;
			permissions: { mask: number };
		}>,
	): Promise<Signer[]> {
		const results: Signer[] = [];

		for (const signer of signers) {
			const record = await this.prisma.signer.create({
				data: {
					address: signer.address,
					multisigId: signer.multisigId,
					permissions: signer.permissions,
				},
			});
			results.push(mapPrismaSignerToDomain(record));
		}

		return results;
	}

	async deleteByMultisigId(multisigId: string): Promise<void> {
		await this.prisma.signer.deleteMany({
			where: { multisigId },
		});
	}
}

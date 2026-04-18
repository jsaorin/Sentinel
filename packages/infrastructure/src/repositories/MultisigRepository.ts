import type { Multisig } from "@sentinel/domain";
import type { IMultisigRepository } from "@sentinel/domain/repositories";
import { injectable } from "inversify";
import { mapPrismaMultisigToDomain } from "../mappers/MultisigMapper.js";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";

@injectable()
export class MultisigRepository implements IMultisigRepository {
	private get prisma() {
		return getPrismaClient();
	}

	async findAll(): Promise<Multisig[]> {
		const records = await this.prisma.multisig.findMany({
			orderBy: { createdAt: "desc" },
		});
		return records.map(mapPrismaMultisigToDomain);
	}

	async findById(id: string): Promise<Multisig | null> {
		const record = await this.prisma.multisig.findUnique({ where: { id } });
		return record ? mapPrismaMultisigToDomain(record) : null;
	}

	async findByAddress(address: string): Promise<Multisig | null> {
		const record = await this.prisma.multisig.findUnique({
			where: { address },
		});
		return record ? mapPrismaMultisigToDomain(record) : null;
	}

	async create(data: {
		address: string;
		label?: string | null;
	}): Promise<Multisig> {
		const record = await this.prisma.multisig.create({
			data: {
				address: data.address,
				label: data.label ?? null,
			},
		});
		return mapPrismaMultisigToDomain(record);
	}

	async update(
		id: string,
		data: { threshold?: number; configAuthority?: string | null },
	): Promise<Multisig> {
		const record = await this.prisma.multisig.update({
			where: { id },
			data,
		});
		return mapPrismaMultisigToDomain(record);
	}
}

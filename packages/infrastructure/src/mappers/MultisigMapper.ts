import type { Multisig as PrismaMultisig } from "../../generated/client/index.js";
import { Multisig } from "@sentinel/domain";

export function mapPrismaMultisigToDomain(record: PrismaMultisig): Multisig {
	return new Multisig({
		id: record.id,
		address: record.address,
		label: record.label,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
	});
}

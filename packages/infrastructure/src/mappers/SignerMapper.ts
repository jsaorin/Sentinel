import type { Signer as PrismaSigner } from "../../generated/client/index.js";
import { Signer } from "@sentinel/domain";

export function mapPrismaSignerToDomain(record: PrismaSigner): Signer {
	return new Signer({
		id: record.id,
		address: record.address,
		multisigId: record.multisigId,
		permissions: record.permissions as { mask: number },
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
	});
}

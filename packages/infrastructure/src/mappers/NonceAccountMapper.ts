import { NonceAccount } from "@sentinel/domain";
import type { NonceAccount as PrismaNonceAccount } from "../../generated/client/index.js";

export function mapPrismaNonceAccountToDomain(
	record: PrismaNonceAccount,
): NonceAccount {
	return new NonceAccount({
		id: record.id,
		address: record.address,
		authority: record.authority,
		fundedBy: record.fundedBy,
		multisigId: record.multisigId,
		signerId: record.signerId,
		externallyFunded: record.externallyFunded,
		detectedAt: record.detectedAt,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
	});
}

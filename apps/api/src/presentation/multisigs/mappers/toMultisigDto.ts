import type { GetMultisigQueryOutputDto } from "@sentinel/application";
import type { MultisigDto } from "@sentinel/common/dtos";
import { toMultisigScoreDto } from "./toMultisigScoreDto.js";

export function toMultisigDto(
	output: GetMultisigQueryOutputDto,
): MultisigDto {
	return {
		id: output.id,
		address: output.address,
		label: output.label,
		threshold: output.threshold,
		configAuthority: output.configAuthority,
		totalSigners: output.totalSigners,
		vaults: output.vaults,
		healthScore: output.healthScore ? toMultisigScoreDto(output.healthScore) : null,
		createdAt: output.createdAt.toISOString(),
	};
}

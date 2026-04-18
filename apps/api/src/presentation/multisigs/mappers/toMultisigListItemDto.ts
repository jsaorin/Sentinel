import type { ListMultisigsQueryOutputItem } from "@sentinel/application";
import type { MultisigListItemDto } from "@sentinel/common/dtos";

export function toMultisigListItemDto(
	item: ListMultisigsQueryOutputItem,
): MultisigListItemDto {
	return {
		id: item.id,
		address: item.address,
		label: item.label,
		threshold: item.threshold,
		totalSigners: item.totalSigners,
		healthScore: item.healthScore,
		activeProposals: item.activeProposals,
		lastActivity: item.lastActivity ? item.lastActivity.toISOString() : null,
		createdAt: item.createdAt.toISOString(),
	};
}

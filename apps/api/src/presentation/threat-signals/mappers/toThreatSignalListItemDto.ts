import type { ListThreatSignalsQueryOutputItem } from "@sentinel/application";
import type { ThreatSignalListItemDto } from "@sentinel/common/dtos";

export function toThreatSignalListItemDto(
	item: ListThreatSignalsQueryOutputItem,
): ThreatSignalListItemDto {
	return {
		id: item.id,
		sourceKind: item.sourceKind,
		sourceLabel: item.sourceLabel,
		sourceUrl: item.sourceUrl,
		severity: item.severity,
		category: item.category,
		summary: item.summary,
		isThreat: item.isThreat,
		capturedAt: item.capturedAt.toISOString(),
		analyzedAt: item.analyzedAt ? item.analyzedAt.toISOString() : null,
	};
}

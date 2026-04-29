import type { ListThreatSignalsQueryOutputItem } from "@sentinel/application";
import type {
	AffectedEntityDto,
	ThreatSignalListItemDto,
} from "@sentinel/common/dtos";

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
		entities: item.entities.map(
			(e): AffectedEntityDto => ({
				kind: e.kind,
				address: e.address,
				role: e.role,
				contextSnippet: e.contextSnippet,
			}),
		),
	};
}

import {
	AffectedEntity,
	type AffectedEntityKind,
	type AffectedEntityRole,
	type ThreatCategory,
	type ThreatSeverity,
	ThreatSignal,
	type ThreatSourceKind,
} from "@sentinel/domain";
import type {
	ThreatSignal as PrismaThreatSignal,
	ThreatSignalEntity as PrismaThreatSignalEntity,
} from "../../generated/client/index.js";

type PrismaThreatSignalWithEntities = PrismaThreatSignal & {
	entities: PrismaThreatSignalEntity[];
};

export function mapPrismaThreatSignalToDomain(
	record: PrismaThreatSignalWithEntities,
): ThreatSignal {
	return new ThreatSignal({
		id: record.id,
		source: {
			kind: record.sourceKind as ThreatSourceKind,
			identifier: record.sourceIdentifier,
			label: record.sourceLabel ?? undefined,
		},
		externalId: record.externalId,
		content: record.content,
		capturedAt: record.capturedAt,
		sourceUrl: record.sourceUrl ?? null,
		isThreat: record.isThreat,
		severity: record.severity as ThreatSeverity | null,
		category: record.category as ThreatCategory | null,
		summary: record.summary,
		rawAnalysisJson: record.rawAnalysisJson,
		entities: record.entities.map(mapPrismaThreatSignalEntityToDomain),
		analyzedAt: record.analyzedAt,
		createdAt: record.createdAt,
	});
}

export function mapPrismaThreatSignalEntityToDomain(
	record: PrismaThreatSignalEntity,
): AffectedEntity {
	return new AffectedEntity(
		record.kind as AffectedEntityKind,
		record.address,
		record.role as AffectedEntityRole | null,
		record.contextSnippet,
		record.id,
	);
}

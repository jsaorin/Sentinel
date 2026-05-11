import type { ThreatSignal } from "../entities/ThreatSignal.js";
import type {
	ThreatSource,
	ThreatSourceKind,
} from "../events/ThreatSignalReceived.js";

export type ThreatSignalSortField = "capturedAt" | "createdAt";
export type ThreatSignalSortOrder = "asc" | "desc";

export type FindAllThreatSignalsPaginatedOptions = {
	skip: number;
	take: number;
	sourceKind?: ThreatSourceKind;
	isThreat?: boolean;
	sortBy: ThreatSignalSortField;
	sortOrder: ThreatSignalSortOrder;
};

export type CountThreatSignalsOptions = {
	sourceKind?: ThreatSourceKind;
	isThreat?: boolean;
};

export interface IThreatSignalRepository {
	findById(id: string): Promise<ThreatSignal | null>;
	findByExternalRef(
		source: ThreatSource,
		externalId: string,
	): Promise<ThreatSignal | null>;
	save(signal: ThreatSignal): Promise<ThreatSignal>;
	findAllPaginated(
		options: FindAllThreatSignalsPaginatedOptions,
	): Promise<ThreatSignal[]>;
	countAll(options: CountThreatSignalsOptions): Promise<number>;
}

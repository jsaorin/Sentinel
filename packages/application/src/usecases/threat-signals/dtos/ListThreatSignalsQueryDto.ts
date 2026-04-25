import type {
	ThreatCategory,
	ThreatSeverity,
	ThreatSignalSortField,
	ThreatSignalSortOrder,
	ThreatSourceKind,
} from "@sentinel/domain";

export type ListThreatSignalsQueryInputDto = {
	page: number;
	pageSize: number;
	sourceKind?: ThreatSourceKind;
	isThreat?: boolean;
	sortBy: ThreatSignalSortField;
	sortOrder: ThreatSignalSortOrder;
};

export type ListThreatSignalsQueryOutputItem = {
	id: string;
	sourceKind: ThreatSourceKind;
	sourceLabel: string | null;
	sourceUrl: string | null;
	severity: ThreatSeverity | null;
	category: ThreatCategory | null;
	summary: string | null;
	isThreat: boolean | null;
	capturedAt: Date;
	analyzedAt: Date | null;
};

export type ListThreatSignalsQueryPagination = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

export type ListThreatSignalsQueryOutputDto = {
	items: ListThreatSignalsQueryOutputItem[];
	pagination: ListThreatSignalsQueryPagination;
};

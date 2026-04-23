import type { ThreatSource } from "@sentinel/domain";

export type AnalyzeThreatSignalCommandInputDto = {
	source: ThreatSource;
	externalId: string;
	content: string;
	capturedAt: Date;
};

export type AnalyzeThreatSignalCommandOutputDto = {
	signalId: string;
	isThreat: boolean | null;
	entityCount: number;
	skipped: boolean;
};

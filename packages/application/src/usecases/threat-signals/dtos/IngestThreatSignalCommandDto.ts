import type { ThreatSource } from "@sentinel/domain";

export type IngestThreatSignalCommandInputDto = {
	source: ThreatSource;
	externalId: string;
	content: string;
	capturedAt: Date;
	sourceUrl?: string | null;
};

export type IngestThreatSignalCommandOutputDto = {
	eventId: string;
	published: boolean;
};

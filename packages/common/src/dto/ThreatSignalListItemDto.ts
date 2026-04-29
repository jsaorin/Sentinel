import type { AffectedEntityDto } from "./AffectedEntityDto.js";

export class ThreatSignalListItemDto {
	id: string;
	sourceKind: "telegram" | "twitter" | "rss";
	sourceLabel: string | null;
	sourceUrl: string | null;
	severity: "low" | "medium" | "high" | null;
	category:
		| "phishing"
		| "rugpull"
		| "exploit"
		| "compromised_key"
		| "other"
		| null;
	summary: string | null;
	isThreat: boolean | null;
	capturedAt: string;
	analyzedAt: string | null;
	entities: AffectedEntityDto[];
}

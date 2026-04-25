import type { ThreatSource } from "../events/ThreatSignalReceived.js";
import type { AffectedEntity } from "./AffectedEntity.js";

export type ThreatSeverity = "low" | "medium" | "high";

export type ThreatCategory =
	| "phishing"
	| "rugpull"
	| "exploit"
	| "compromised_key"
	| "other";

export interface ThreatSignalAnalysis {
	isThreat: boolean;
	severity: ThreatSeverity | null;
	category: ThreatCategory | null;
	summary: string | null;
	rawAnalysisJson: unknown;
	entities: AffectedEntity[];
}

export class ThreatSignal {
	public readonly id: string | null;
	public readonly source: ThreatSource;
	public readonly externalId: string;
	public readonly content: string;
	public readonly capturedAt: Date;
	public readonly sourceUrl: string | null;
	public readonly isThreat: boolean | null;
	public readonly severity: ThreatSeverity | null;
	public readonly category: ThreatCategory | null;
	public readonly summary: string | null;
	public readonly rawAnalysisJson: unknown;
	public readonly entities: AffectedEntity[];
	public readonly analyzedAt: Date | null;
	public readonly createdAt: Date | null;

	constructor(params: {
		id?: string | null;
		source: ThreatSource;
		externalId: string;
		content: string;
		capturedAt: Date;
		sourceUrl?: string | null;
		isThreat?: boolean | null;
		severity?: ThreatSeverity | null;
		category?: ThreatCategory | null;
		summary?: string | null;
		rawAnalysisJson?: unknown;
		entities?: AffectedEntity[];
		analyzedAt?: Date | null;
		createdAt?: Date | null;
	}) {
		this.id = params.id ?? null;
		this.source = params.source;
		this.externalId = params.externalId;
		this.content = params.content;
		this.capturedAt = params.capturedAt;
		this.sourceUrl = params.sourceUrl ?? null;
		this.isThreat = params.isThreat ?? null;
		this.severity = params.severity ?? null;
		this.category = params.category ?? null;
		this.summary = params.summary ?? null;
		this.rawAnalysisJson = params.rawAnalysisJson ?? null;
		this.entities = params.entities ?? [];
		this.analyzedAt = params.analyzedAt ?? null;
		this.createdAt = params.createdAt ?? null;
	}
}

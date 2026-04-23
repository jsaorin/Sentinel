import type { ThreatSource } from "../events/ThreatSignalReceived.js";
import type { ThreatSignal } from "../entities/ThreatSignal.js";

export interface IThreatSignalRepository {
	findByExternalRef(
		source: ThreatSource,
		externalId: string,
	): Promise<ThreatSignal | null>;
	save(signal: ThreatSignal): Promise<ThreatSignal>;
}

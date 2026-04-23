export const THREAT_SIGNAL_USE_CASE_TYPES = {
	IngestThreatSignalCommandHandler: Symbol.for(
		"IngestThreatSignalCommandHandler",
	),
	AnalyzeThreatSignalCommandHandler: Symbol.for(
		"AnalyzeThreatSignalCommandHandler",
	),
} as const;

export const SECURITY_USE_CASE_TYPES = {
	IngestDetectedNonceCommandHandler: Symbol.for(
		"IngestDetectedNonceCommandHandler",
	),
	ListNonceWarningsQueryHandler: Symbol.for("ListNonceWarningsQueryHandler"),
} as const;

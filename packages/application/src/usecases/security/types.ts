export const SECURITY_USE_CASE_TYPES = {
	ScanSignerNoncesCommandHandler: Symbol.for("ScanSignerNoncesCommandHandler"),
	ScanMultisigNoncesCommandHandler: Symbol.for(
		"ScanMultisigNoncesCommandHandler",
	),
	ScanAllMultisigsNoncesCommandHandler: Symbol.for(
		"ScanAllMultisigsNoncesCommandHandler",
	),
	ListNonceWarningsQueryHandler: Symbol.for("ListNonceWarningsQueryHandler"),
} as const;

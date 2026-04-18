export const MULTISIG_USE_CASE_TYPES = {
	CreateMultisigCommandHandler: Symbol.for("CreateMultisigCommandHandler"),
	AnalyzeMultisigCommandHandler: Symbol.for("AnalyzeMultisigCommandHandler"),
	GetMultisigQueryHandler: Symbol.for("GetMultisigQueryHandler"),
	ListMultisigsQueryHandler: Symbol.for("ListMultisigsQueryHandler"),
	ListSignersQueryHandler: Symbol.for("ListSignersQueryHandler"),
	ListProposalsQueryHandler: Symbol.for("ListProposalsQueryHandler"),
} as const;

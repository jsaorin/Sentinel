export const MULTISIG_USE_CASE_TYPES = {
	CreateMultisigCommandHandler: Symbol.for("CreateMultisigCommandHandler"),
	AnalyzeMultisigCommandHandler: Symbol.for("AnalyzeMultisigCommandHandler"),
	GetMultisigQueryHandler: Symbol.for("GetMultisigQueryHandler"),
	ListSignersQueryHandler: Symbol.for("ListSignersQueryHandler"),
	ListProposalsQueryHandler: Symbol.for("ListProposalsQueryHandler"),
} as const;

export const REALTIME_SYNC_USE_CASE_TYPES = {
	SyncMultisigStateCommandHandler: Symbol.for(
		"SyncMultisigStateCommandHandler",
	),
	ReconcileProposalCommandHandler: Symbol.for(
		"ReconcileProposalCommandHandler",
	),
} as const;

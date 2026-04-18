export const SCORING_USE_CASE_TYPES = {
	ScoreMultisigHealthCommandHandler: Symbol.for(
		"ScoreMultisigHealthCommandHandler",
	),
	ScoreProposalsCommandHandler: Symbol.for("ScoreProposalsCommandHandler"),
} as const;

import { onProposalScored } from "../handler/scoring/onProposalScored.js";
import { ProposalScoredSchema } from "../handler/scoring/schema.js";
import type { Subscription } from "../messaging/types.js";
import { compose } from "../middleware/compose.js";
import { withErrorBoundary } from "../middleware/error-boundary.js";
import { withIdempotency } from "../middleware/idempotency.js";
import { withLogger } from "../middleware/logger.js";

export const proposalAiAnalysisSubscription: Subscription = {
	exchange: "reactor.events",
	queue: "reactor.proposal.ai-analysis",
	keys: ["proposal.scored"],

	concurrency: 5,

	retry: {
		attempts: 5,
		backoff: { kind: "exponential", baseMs: 5000, factor: 2, maxMs: 300000 },
		jitter: { type: "percent", percent: 0.2 },
	},

	dlq: {
		exchange: "reactor.dlx",
		queue: "reactor.proposal.ai-analysis.dlq",
	},

	validate: (e) => ProposalScoredSchema.parse(e),
	handler: compose(
		withErrorBoundary(),
		withLogger(),
		withIdempotency(),
	)(onProposalScored),
};

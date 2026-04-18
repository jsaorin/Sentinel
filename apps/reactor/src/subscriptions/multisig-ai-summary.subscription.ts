import { onMultisigScored } from "../handler/scoring/onMultisigScored.js";
import { MultisigScoredSchema } from "../handler/scoring/schema.js";
import type { Subscription } from "../messaging/types.js";
import { compose } from "../middleware/compose.js";
import { withErrorBoundary } from "../middleware/error-boundary.js";
import { withIdempotency } from "../middleware/idempotency.js";
import { withLogger } from "../middleware/logger.js";

export const multisigAiSummarySubscription: Subscription = {
	exchange: "reactor.events",
	queue: "reactor.multisig.ai-summary",
	keys: ["multisig.scored"],

	concurrency: 3,

	retry: {
		attempts: 5,
		backoff: { kind: "exponential", baseMs: 5000, factor: 2, maxMs: 300000 },
		jitter: { type: "percent", percent: 0.2 },
	},

	dlq: {
		exchange: "reactor.dlx",
		queue: "reactor.multisig.ai-summary.dlq",
	},

	validate: (e) => MultisigScoredSchema.parse(e),
	handler: compose(
		withErrorBoundary(),
		withLogger(),
		withIdempotency(),
	)(onMultisigScored),
};

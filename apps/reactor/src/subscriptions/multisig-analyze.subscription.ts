import { compose } from "../middleware/compose.js";
import { withErrorBoundary } from "../middleware/error-boundary.js";
import { withIdempotency } from "../middleware/idempotency.js";
import { withLogger } from "../middleware/logger.js";
import type { Subscription } from "../messaging/types.js";
import { onMultisigCreated } from "../handler/multisig/onMultisigCreated.js";
import { MultisigCreatedSchema } from "../handler/multisig/schema.js";

export const multisigAnalyzeSubscription: Subscription = {
	exchange: "reactor.events",
	queue: "reactor.multisig.analyze",
	keys: ["multisig.created"],

	concurrency: 5,

	retry: {
		attempts: 5,
		backoff: { kind: "exponential", baseMs: 5000, factor: 2, maxMs: 300000 },
		jitter: { type: "percent", percent: 0.2 },
	},

	dlq: {
		exchange: "reactor.dlx",
		queue: "reactor.multisig.analyze.dlq",
	},

	validate: (e) => MultisigCreatedSchema.parse(e),
	handler: compose(
		withErrorBoundary(),
		withLogger(),
		withIdempotency(),
	)(onMultisigCreated),
};

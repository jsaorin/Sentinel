import { onMultisigNonceScanRequested } from "../handler/security/onMultisigNonceScanRequested.js";
import { MultisigNonceScanRequestedSchema } from "../handler/security/schema.js";
import type { Subscription } from "../messaging/types.js";
import { compose } from "../middleware/compose.js";
import { withErrorBoundary } from "../middleware/error-boundary.js";
import { withIdempotency } from "../middleware/idempotency.js";
import { withLogger } from "../middleware/logger.js";

export const multisigNonceScanSubscription: Subscription = {
	exchange: "reactor.events",
	queue: "reactor.multisig.nonce-scan",
	keys: ["multisig.scan.nonces.requested"],

	concurrency: 3,

	retry: {
		attempts: 3,
		backoff: { kind: "exponential", baseMs: 5000, factor: 2, maxMs: 60000 },
		jitter: { type: "percent", percent: 0.2 },
	},

	dlq: {
		exchange: "reactor.dlx",
		queue: "reactor.multisig.nonce-scan.dlq",
	},

	validate: (e) => MultisigNonceScanRequestedSchema.parse(e),
	handler: compose(
		withErrorBoundary(),
		withLogger(),
		withIdempotency(),
	)(onMultisigNonceScanRequested),
};

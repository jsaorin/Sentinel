import { onThreatEntityDetected } from "../handler/threat-signals/onThreatEntityDetected.js";
import { ThreatEntityDetectedSchema } from "../handler/threat-signals/threatEntityDetected.schema.js";
import type { Subscription } from "../messaging/types.js";
import { compose } from "../middleware/compose.js";
import { withErrorBoundary } from "../middleware/error-boundary.js";
import { withIdempotency } from "../middleware/idempotency.js";
import { withLogger } from "../middleware/logger.js";

export const threatEntityLinkSubscription: Subscription = {
	exchange: "reactor.events",
	queue: "reactor.threat-entity.link",
	keys: ["threat.entity.detected"],

	concurrency: 5,

	retry: {
		attempts: 5,
		backoff: { kind: "exponential", baseMs: 5000, factor: 2, maxMs: 300000 },
		jitter: { type: "percent", percent: 0.2 },
	},

	dlq: {
		exchange: "reactor.dlx",
		queue: "reactor.threat-entity.link.dlq",
	},

	validate: (e) => ThreatEntityDetectedSchema.parse(e),
	handler: compose(
		withErrorBoundary(),
		withLogger(),
		withIdempotency(),
	)(onThreatEntityDetected),
};

import { onThreatSignalReceived } from "../handler/threat-signals/onThreatSignalReceived.js";
import { ThreatSignalReceivedSchema } from "../handler/threat-signals/schema.js";
import type { Subscription } from "../messaging/types.js";
import { compose } from "../middleware/compose.js";
import { withErrorBoundary } from "../middleware/error-boundary.js";
import { withIdempotency } from "../middleware/idempotency.js";
import { withLogger } from "../middleware/logger.js";

export const threatSignalAnalysisSubscription: Subscription = {
	exchange: "reactor.events",
	queue: "reactor.threat-signal.analyze",
	keys: ["threat.signal.received"],

	concurrency: 3,

	retry: {
		attempts: 5,
		backoff: { kind: "exponential", baseMs: 5000, factor: 2, maxMs: 300000 },
		jitter: { type: "percent", percent: 0.2 },
	},

	dlq: {
		exchange: "reactor.dlx",
		queue: "reactor.threat-signal.analyze.dlq",
	},

	validate: (e) => ThreatSignalReceivedSchema.parse(e),
	handler: compose(
		withErrorBoundary(),
		withLogger(),
		withIdempotency(),
	)(onThreatSignalReceived),
};

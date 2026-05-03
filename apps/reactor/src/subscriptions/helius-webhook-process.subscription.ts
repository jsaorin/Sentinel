import { onHeliusWebhookReceived } from "../handler/webhooks/onHeliusWebhookReceived.js";
import { HeliusWebhookEventSchema } from "../handler/webhooks/schema.js";
import type { Subscription } from "../messaging/types.js";
import { compose } from "../middleware/compose.js";
import { withErrorBoundary } from "../middleware/error-boundary.js";
import { withIdempotency } from "../middleware/idempotency.js";
import { withLogger } from "../middleware/logger.js";

export const heliusWebhookProcessSubscription: Subscription = {
	exchange: "reactor.events",
	queue: "reactor.webhook.helius.process",
	keys: ["webhook.helius.received"],

	concurrency: 5,

	retry: {
		attempts: 5,
		backoff: { kind: "exponential", baseMs: 5000, factor: 2, maxMs: 300000 },
		jitter: { type: "percent", percent: 0.2 },
	},

	dlq: {
		exchange: "reactor.dlx",
		queue: "reactor.webhook.helius.process.dlq",
	},

	validate: (e) => HeliusWebhookEventSchema.parse(e),
	handler: compose(
		withErrorBoundary(),
		withLogger(),
		withIdempotency(),
	)(onHeliusWebhookReceived),
};

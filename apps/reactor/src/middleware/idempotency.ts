import { APPLICATION_TYPES } from "@sentinel/application";
import type { InboxStore } from "@sentinel/application";
import type { Middleware } from "../messaging/types.js";

export const withIdempotency =
	(processedTtlSeconds = 24 * 60 * 60, lockTtlSeconds = 60): Middleware =>
	(next) =>
	async (ctx) => {
		const inbox = ctx.container.get<InboxStore>(APPLICATION_TYPES.InboxStore);

		const contextualId = `${ctx.queue}:${ctx.event.id}`;

		if (await inbox.isProcessed(contextualId)) {
			ctx.logger.warning("event:duplicate-skipped(processed)", {
				id: ctx.event.id,
				queue: ctx.queue,
			});
			return;
		}

		const locked = await inbox.tryAcquireLock(contextualId, lockTtlSeconds);
		if (!locked) {
			ctx.logger.warning("event:duplicate-skipped(in-flight)", {
				id: ctx.event.id,
				queue: ctx.queue,
			});
			return;
		}

		try {
			await next(ctx);
			await inbox.markProcessed(contextualId, processedTtlSeconds);
		} finally {
			await inbox.releaseLock(contextualId);
		}
	};

import type { Middleware } from "../messaging/types.js";

export const withLogger = (): Middleware => (next) => async (ctx) => {
	const { logger, event, queue } = ctx;

	const t0 = Date.now();

	logger.info("event:received", {
		type: event.type,
		id: event.id,
		queue,
		propagationDelay: event.metadata?.publishedAt
			? Date.now() - new Date(event.metadata.publishedAt as string).getTime()
			: undefined,
	});

	try {
		await next(ctx);
		logger.info("event:processed", {
			type: event.type,
			id: event.id,
			queue,
			ms: Date.now() - t0,
		});
	} catch (e) {
		logger.error("event:failed", {
			type: event.type,
			id: event.id,
			queue,
			err: (e as Error).message,
			stack: (e as Error).stack,
		});
		throw e;
	}
};

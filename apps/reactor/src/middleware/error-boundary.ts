import type { Middleware } from "../messaging/types.js";

export const withErrorBoundary = (): Middleware => (next) => async (ctx) => {
	try {
		await next(ctx);
	} catch (e) {
		ctx.logger.error("handler:error", {
			id: ctx.event.id,
			err: (e as Error).stack,
		});
		throw e;
	}
};

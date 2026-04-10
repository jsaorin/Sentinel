import type { Handler, Middleware } from "../messaging/types.js";

export const compose =
	<T>(...mws: Middleware<T>[]) =>
	(h: Handler<T>): Handler<T> =>
		mws.reduceRight((acc, mw) => mw(acc), h);

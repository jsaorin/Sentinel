import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import type { ILogger } from "../logger/definition.js";

export class QueryValidator {
	static validate = <T>(logger: ILogger, schema: ZodSchema<T>) => {
		return (req: Request, _res: Response, next: NextFunction) => {
			const result = schema.safeParse(req.query);

			if (result.success) {
				req.query = result.data as Record<string, string>;
				next();
				return;
			}

			const rawErrors = result.error.issues.map(
				(e) => `${e.path.join(".")}: ${e.message}`,
			);
			logger.error("Query validation error", { err: rawErrors });
			next(
				Object.assign(new Error("Query validation failed"), {
					statusCode: 422,
					errors: rawErrors,
				}),
			);
		};
	};
}

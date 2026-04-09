import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import type { ILogger } from "../logger/definition.js";

export class BodyValidator {
	static validate = <T>(logger: ILogger, schema: ZodSchema<T>) => {
		return (req: Request, _res: Response, next: NextFunction) => {
			const result = schema.safeParse(req.body);

			if (result.success) {
				req.body = result.data;
				next();
				return;
			}

			const rawErrors = result.error.issues.map(
				(e) => `${e.path.join(".")}: ${e.message}`,
			);
			logger.error("Body validation error", { err: rawErrors });
			next(
				Object.assign(new Error("Body validation failed"), {
					statusCode: 422,
					errors: rawErrors,
				}),
			);
		};
	};
}

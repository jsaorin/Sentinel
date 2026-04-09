import { ServiceError } from "@sentinel/common/errors";
import { ResourceNotFoundError } from "@sentinel/domain/errors";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import environment from "../env/api-environment.js";
import { logger } from "../logger/logger.js";

interface ErrorBody {
	success: false;
	message: string;
	stack?: string;
}

export const errorHandler = () => {
	return (err: Error, req: Request, res: Response, _next: NextFunction) => {
		logger.error("Request Error", {
			path: req.path,
			method: req.method,
			errorMessage: err.message,
			stack: err.stack,
		});

		const errorBody: ErrorBody = {
			success: false,
			message:
				environment.isDev() || environment.isLocal()
					? err.message
					: "Internal Server Error",
			stack:
				environment.isDev() || environment.isLocal() ? err.stack : undefined,
		};

		let statusCode = 500;
		if ("statusCode" in err && typeof err.statusCode === "number") {
			statusCode = err.statusCode;
			errorBody.message = err.message;
		} else if (err instanceof ZodError) {
			statusCode = 422;
			errorBody.message = err.issues
				.map((e) => `${e.path.join(".")}: ${e.message}`)
				.join(", ");
		} else if (err instanceof ServiceError) {
			statusCode = 400;
		} else if (err instanceof ResourceNotFoundError) {
			statusCode = 404;
		}

		res.status(statusCode).json(errorBody);
	};
};

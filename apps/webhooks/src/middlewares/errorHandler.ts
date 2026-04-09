import type { NextFunction, Request, Response } from "express";
import environment from "../env/webhooks-environment.js";
import { logger } from "../logger/logger.js";

export const errorHandler = () => {
	return (err: Error, req: Request, res: Response, _next: NextFunction) => {
		logger.error("Request Error", {
			path: req.path,
			method: req.method,
			errorMessage: err.message,
			stack: err.stack,
		});

		res.status(500).json({
			success: false,
			message:
				environment.isDev() || environment.isLocal()
					? err.message
					: "Internal Server Error",
		});
	};
};

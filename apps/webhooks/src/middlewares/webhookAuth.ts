import type { NextFunction, Request, Response } from "express";
import { logger } from "../logger/logger.js";

export const validateWebhookAuth = (authToken: string) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!authToken) {
			return next();
		}

		const authHeader = req.headers.authorization;

		if (!authHeader) {
			logger.warning("Webhook request missing authorization header", {
				ip: req.ip,
				path: req.path,
			});
			res.status(401).json({ success: false, message: "Unauthorized" });
			return;
		}

		const token = authHeader.split(" ")[1];
		if (token !== authToken) {
			logger.warning("Webhook request with invalid auth token", {
				ip: req.ip,
				path: req.path,
			});
			res.status(401).json({ success: false, message: "Unauthorized" });
			return;
		}

		next();
	};
};

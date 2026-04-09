import {
	APPLICATION_TYPES,
	type SaveWebhookEventCommandHandler,
} from "@sentinel/application";
import { Api } from "@sentinel/common/api";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import environment from "../../env/webhooks-environment.js";
import { logger } from "../../logger/logger.js";

@injectable()
export class HeliusWebhookController extends Api {
	constructor(
		@inject(APPLICATION_TYPES.SaveWebhookEventCommandHandler)
		private saveWebhookEventHandler: SaveWebhookEventCommandHandler,
	) {
		super(logger, environment);
	}

	handleHeliusWebhook = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const payload = req.body;
			const events = Array.isArray(payload) ? payload : [payload];

			this.logger.info("Received Helius webhook", {
				eventCount: events.length,
			});

			await this.saveWebhookEventHandler.execute({ payload: events });

			this.send(res, "OK");
		} catch (error) {
			next(error);
		}
	};
}

import {
	APPLICATION_TYPES,
	type HealthCheckQueryHandler,
} from "@sentinel/application";
import { Api } from "@sentinel/common/api";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import environment from "../../env/api-environment.js";
import { logger } from "../../logger/logger.js";

@injectable()
export class HealthController extends Api {
	constructor(
		@inject(APPLICATION_TYPES.HealthCheckQueryHandler)
		private healthCheckQueryHandler: HealthCheckQueryHandler,
	) {
		super(logger, environment);
	}

	async health(_req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const result = await this.healthCheckQueryHandler.execute();
			this.send(res, result);
		} catch (e) {
			next(e);
		}
	}
}

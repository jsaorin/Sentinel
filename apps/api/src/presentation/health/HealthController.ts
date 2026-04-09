import {
	APPLICATION_TYPES,
	type HealthCheckQueryHandler,
} from "@sentinel/application";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class HealthController {
	constructor(
		@inject(APPLICATION_TYPES.HealthCheckQueryHandler)
		private healthCheckQueryHandler: HealthCheckQueryHandler,
	) {}

	async health(_req: Request, res: Response): Promise<void> {
		const result = await this.healthCheckQueryHandler.execute();
		res.json(result);
	}
}

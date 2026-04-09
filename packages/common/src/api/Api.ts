import type { Response } from "express";
import { injectable } from "inversify";
import type { IEnvironment } from "../env/environment.js";
import type { ILogger } from "../logger/definition.js";

@injectable()
export abstract class Api {
	protected logger: ILogger;
	protected environment: IEnvironment;

	constructor(logger: ILogger, environment: IEnvironment) {
		this.logger = logger;
		this.environment = environment;
	}

	public send<T>(
		res: Response,
		data: T,
		statusCode = 200,
		message = "success",
	) {
		return res.status(statusCode).json({
			message,
			data,
		});
	}
}

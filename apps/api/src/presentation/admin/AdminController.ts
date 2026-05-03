import {
	APPLICATION_TYPES,
	type ScanAllMultisigsNoncesCommandHandler,
	type ScanMultisigNoncesCommandHandler,
} from "@sentinel/application";
import { Api } from "@sentinel/common/api";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import environment from "../../env/api-environment.js";
import { logger } from "../../logger/logger.js";

@injectable()
export class AdminController extends Api {
	constructor(
		@inject(APPLICATION_TYPES.ScanMultisigNoncesCommandHandler)
		private scanMultisigHandler: ScanMultisigNoncesCommandHandler,
		@inject(APPLICATION_TYPES.ScanAllMultisigsNoncesCommandHandler)
		private scanAllHandler: ScanAllMultisigsNoncesCommandHandler,
	) {
		super(logger, environment);
	}

	async triggerNonceScan(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const target = req.query.multisigAddress;
			if (typeof target === "string" && target.length > 0) {
				const result = await this.scanMultisigHandler.execute({
					multisigAddress: target,
				});
				this.send(res, result, 200);
				return;
			}
			const result = await this.scanAllHandler.execute({});
			this.send(res, result, 200);
		} catch (e) {
			next(e);
		}
	}
}

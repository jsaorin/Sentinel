import {
	APPLICATION_TYPES,
	type CreateMultisigCommandHandler,
} from "@sentinel/application";
import { Api } from "@sentinel/common/api";
import type { MultisigDto } from "@sentinel/common/dtos";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import environment from "../../env/api-environment.js";
import { logger } from "../../logger/logger.js";

@injectable()
export class MultisigController extends Api {
	constructor(
		@inject(APPLICATION_TYPES.CreateMultisigCommandHandler)
		private createMultisigHandler: CreateMultisigCommandHandler,
	) {
		super(logger, environment);
	}

	async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const result = await this.createMultisigHandler.execute(req.body);

			const dto: MultisigDto = {
				id: result.id,
				address: result.address,
				label: result.label,
				createdAt: result.createdAt,
			};

			this.send(res, dto, 201);
		} catch (e) {
			next(e);
		}
	}
}

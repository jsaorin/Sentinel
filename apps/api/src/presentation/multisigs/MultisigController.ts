import {
	APPLICATION_TYPES,
	type CreateMultisigCommandHandler,
	type ListProposalsQueryHandler,
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
		@inject(APPLICATION_TYPES.ListProposalsQueryHandler)
		private listProposalsHandler: ListProposalsQueryHandler,
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

	async listProposals(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const multisigId = req.params.multisigId as string;
			const result = await this.listProposalsHandler.execute({ multisigId });

			const dto = result.proposals.map((p) => ({
				...p,
				createdAt: p.createdAt.toISOString(),
				executedAt: p.executedAt?.toISOString() ?? null,
			}));

			this.send(res, dto, 200);
		} catch (e) {
			next(e);
		}
	}
}

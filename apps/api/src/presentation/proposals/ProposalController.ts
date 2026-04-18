import {
	APPLICATION_TYPES,
	type GetProposalDetailQueryHandler,
} from "@sentinel/application";
import { Api } from "@sentinel/common/api";
import type { ProposalDetailDto } from "@sentinel/common/dtos";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import environment from "../../env/api-environment.js";
import { logger } from "../../logger/logger.js";
import { toProposalDetailDto } from "./mappers/toProposalDetailDto.js";

@injectable()
export class ProposalController extends Api {
	constructor(
		@inject(APPLICATION_TYPES.GetProposalDetailQueryHandler)
		private getProposalDetailHandler: GetProposalDetailQueryHandler,
	) {
		super(logger, environment);
	}

	async getDetail(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const proposalId = req.params.proposalId as string;
			const result = await this.getProposalDetailHandler.execute({
				proposalId,
			});
			const dto: ProposalDetailDto = toProposalDetailDto(result);
			this.send(res, dto, 200);
		} catch (e) {
			next(e);
		}
	}
}

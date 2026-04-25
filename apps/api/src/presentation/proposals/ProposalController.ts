import {
	APPLICATION_TYPES,
	type GetProposalDetailQueryHandler,
	type ListProposalsFeedQueryHandler,
} from "@sentinel/application";
import { Api } from "@sentinel/common/api";
import type {
	ProposalDetailDto,
	ProposalListItemDto,
} from "@sentinel/common/dtos";
import type { ProposalSortField, ProposalStatus } from "@sentinel/domain";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import environment from "../../env/api-environment.js";
import { logger } from "../../logger/logger.js";
import { toProposalDetailDto } from "./mappers/toProposalDetailDto.js";
import { toProposalListItemDto } from "./mappers/toProposalListItemDto.js";

@injectable()
export class ProposalController extends Api {
	constructor(
		@inject(APPLICATION_TYPES.GetProposalDetailQueryHandler)
		private getProposalDetailHandler: GetProposalDetailQueryHandler,
		@inject(APPLICATION_TYPES.ListProposalsFeedQueryHandler)
		private listProposalsFeedHandler: ListProposalsFeedQueryHandler,
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

	async listFeed(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const { page, pageSize, sortBy, status } = req.query as unknown as {
				page: number;
				pageSize: number;
				sortBy: ProposalSortField;
				status?: ProposalStatus;
			};
			const result = await this.listProposalsFeedHandler.execute({
				page,
				pageSize,
				sortBy,
				status,
			});
			const proposals: ProposalListItemDto[] = result.proposals.map(
				toProposalListItemDto,
			);
			this.send(res, { proposals, pagination: result.pagination }, 200);
		} catch (e) {
			next(e);
		}
	}
}

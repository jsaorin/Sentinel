import {
	APPLICATION_TYPES,
	type ListThreatSignalsQueryHandler,
} from "@sentinel/application";
import { Api } from "@sentinel/common/api";
import type { ThreatSignalListItemDto } from "@sentinel/common/dtos";
import type {
	ThreatSignalSortField,
	ThreatSignalSortOrder,
	ThreatSourceKind,
} from "@sentinel/domain";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import environment from "../../env/api-environment.js";
import { logger } from "../../logger/logger.js";
import { toThreatSignalListItemDto } from "./mappers/toThreatSignalListItemDto.js";

@injectable()
export class ThreatSignalController extends Api {
	constructor(
		@inject(APPLICATION_TYPES.ListThreatSignalsQueryHandler)
		private listThreatSignalsHandler: ListThreatSignalsQueryHandler,
	) {
		super(logger, environment);
	}

	async list(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { page, pageSize, sourceKind, isThreat, sortBy, sortOrder } =
				req.query as unknown as {
					page: number;
					pageSize: number;
					sourceKind?: ThreatSourceKind;
					isThreat?: boolean;
					sortBy: ThreatSignalSortField;
					sortOrder: ThreatSignalSortOrder;
				};

			const result = await this.listThreatSignalsHandler.execute({
				page,
				pageSize,
				sourceKind,
				isThreat,
				sortBy,
				sortOrder,
			});

			const items: ThreatSignalListItemDto[] = result.items.map(
				toThreatSignalListItemDto,
			);
			this.send(res, { items, pagination: result.pagination }, 200);
		} catch (e) {
			next(e);
		}
	}
}

import {
	DOMAIN_TYPES,
	type IThreatSignalRepository,
	type ThreatSourceKind,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	ListThreatSignalsQueryInputDto,
	ListThreatSignalsQueryOutputDto,
} from "../dtos/ListThreatSignalsQueryDto.js";

@injectable()
@injectFromBase()
export class ListThreatSignalsQueryHandler extends BaseUseCase<
	ListThreatSignalsQueryInputDto,
	ListThreatSignalsQueryOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.ThreatSignalRepository)
		private threatSignalRepository: IThreatSignalRepository,
	) {
		super();
	}

	async execute(
		input: ListThreatSignalsQueryInputDto,
	): Promise<ListThreatSignalsQueryOutputDto> {
		const filters = {
			sourceKind: input.sourceKind,
			isThreat: input.isThreat,
		};

		const [signals, total] = await Promise.all([
			this.threatSignalRepository.findAllPaginated({
				skip: (input.page - 1) * input.pageSize,
				take: input.pageSize,
				sortBy: input.sortBy,
				sortOrder: input.sortOrder,
				...filters,
			}),
			this.threatSignalRepository.countAll(filters),
		]);

		return {
			items: signals.map((s) => ({
				id: s.id ?? "",
				sourceKind: s.source.kind as ThreatSourceKind,
				sourceLabel: s.source.label ?? null,
				sourceUrl: s.sourceUrl,
				severity: s.severity,
				category: s.category,
				summary: s.summary,
				isThreat: s.isThreat,
				capturedAt: s.capturedAt,
				analyzedAt: s.analyzedAt,
			})),
			pagination: {
				page: input.page,
				pageSize: input.pageSize,
				total,
				totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
			},
		};
	}
}

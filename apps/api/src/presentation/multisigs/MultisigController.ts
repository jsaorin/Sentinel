import {
	APPLICATION_TYPES,
	type CreateMultisigCommandHandler,
	type GetMultisigQueryHandler,
	type ListMultisigsQueryHandler,
	type ListNonceWarningsQueryHandler,
	type ListProposalsQueryHandler,
	type ListSignersQueryHandler,
} from "@sentinel/application";
import { Api } from "@sentinel/common/api";
import type {
	MultisigDto,
	MultisigListItemDto,
	NonceWarningDto,
	ProposalDto,
	SignerDto,
} from "@sentinel/common/dtos";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import environment from "../../env/api-environment.js";
import { logger } from "../../logger/logger.js";
import { toMultisigDto } from "./mappers/toMultisigDto.js";
import { toMultisigListItemDto } from "./mappers/toMultisigListItemDto.js";
import { toProposalDto } from "./mappers/toProposalDto.js";
import { toSignerDto } from "./mappers/toSignerDto.js";

@injectable()
export class MultisigController extends Api {
	constructor(
		@inject(APPLICATION_TYPES.CreateMultisigCommandHandler)
		private createMultisigHandler: CreateMultisigCommandHandler,
		@inject(APPLICATION_TYPES.GetMultisigQueryHandler)
		private getMultisigHandler: GetMultisigQueryHandler,
		@inject(APPLICATION_TYPES.ListMultisigsQueryHandler)
		private listMultisigsHandler: ListMultisigsQueryHandler,
		@inject(APPLICATION_TYPES.ListSignersQueryHandler)
		private listSignersHandler: ListSignersQueryHandler,
		@inject(APPLICATION_TYPES.ListProposalsQueryHandler)
		private listProposalsHandler: ListProposalsQueryHandler,
		@inject(APPLICATION_TYPES.ListNonceWarningsQueryHandler)
		private listNonceWarningsHandler: ListNonceWarningsQueryHandler,
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
				threshold: null,
				configAuthority: null,
				totalSigners: 0,
				vaults: [],
				healthScore: null,
				createdAt: result.createdAt,
			};

			this.send(res, dto, 201);
		} catch (e) {
			next(e);
		}
	}

	async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const result = await this.listMultisigsHandler.execute({});
			const dto: MultisigListItemDto[] = result.multisigs.map(
				toMultisigListItemDto,
			);
			this.send(res, dto, 200);
		} catch (e) {
			next(e);
		}
	}

	async getMultisig(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const address = req.params.address as string;
			const result = await this.getMultisigHandler.execute({ address });
			const dto: MultisigDto = toMultisigDto(result);
			this.send(res, dto, 200);
		} catch (e) {
			next(e);
		}
	}

	async listSigners(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const address = req.params.address as string;
			const result = await this.listSignersHandler.execute({ address });
			const dto: SignerDto[] = result.signers.map(toSignerDto);
			this.send(res, dto, 200);
		} catch (e) {
			next(e);
		}
	}

	async listProposals(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const address = req.params.address as string;
			const { page, pageSize } = req.query as unknown as {
				page: number;
				pageSize: number;
			};
			const result = await this.listProposalsHandler.execute({
				address,
				page,
				pageSize,
			});
			const proposals: ProposalDto[] = result.proposals.map(toProposalDto);
			this.send(res, { proposals, pagination: result.pagination }, 200);
		} catch (e) {
			next(e);
		}
	}

	async listNonceWarnings(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const address = req.params.address as string;
			const result = await this.listNonceWarningsHandler.execute({
				multisigAddress: address,
			});
			const dto: NonceWarningDto[] = result.warnings.map((w) => ({
				id: w.id,
				signerAddress: w.signerAddress,
				nonceAddress: w.nonceAddress,
				authority: w.authority,
				fundedBy: w.fundedBy,
				externallyFunded: w.externallyFunded,
				severity: w.severity,
				detectedAt: w.detectedAt.toISOString(),
			}));
			this.send(res, dto, 200);
		} catch (e) {
			next(e);
		}
	}
}

import {
	APPLICATION_TYPES,
	type CreateMultisigCommandHandler,
	type GetMultisigQueryHandler,
	type ListSignersQueryHandler,
	type ListProposalsQueryHandler,
} from "@sentinel/application";
import { Api } from "@sentinel/common/api";
import type {
	MultisigDto,
	SignerDto,
	ProposalDto,
} from "@sentinel/common/dtos";
import { decodePermissionsMask } from "@sentinel/common/utils";
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import environment from "../../env/api-environment.js";
import { logger } from "../../logger/logger.js";

@injectable()
export class MultisigController extends Api {
	constructor(
		@inject(APPLICATION_TYPES.CreateMultisigCommandHandler)
		private createMultisigHandler: CreateMultisigCommandHandler,
		@inject(APPLICATION_TYPES.GetMultisigQueryHandler)
		private getMultisigHandler: GetMultisigQueryHandler,
		@inject(APPLICATION_TYPES.ListSignersQueryHandler)
		private listSignersHandler: ListSignersQueryHandler,
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
				threshold: null,
				configAuthority: null,
				vaults: [],
				createdAt: result.createdAt,
			};

			this.send(res, dto, 201);
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

			const dto: MultisigDto = {
				id: result.id,
				address: result.address,
				label: result.label,
				threshold: result.threshold,
				configAuthority: result.configAuthority,
				vaults: result.vaults,
				createdAt: result.createdAt.toISOString(),
			};

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

			const dto: SignerDto[] = result.signers.map((s) => ({
				id: s.id,
				address: s.address,
				permissions: {
					mask: s.permissions.mask,
					...decodePermissionsMask(s.permissions.mask),
				},
			}));

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
			const result = await this.listProposalsHandler.execute({ address });

			const dto: ProposalDto[] = result.proposals.map((p) => ({
				id: p.id,
				proposalIndex: p.proposalIndex,
				transactionIndex: p.transactionIndex,
				pda: p.pda,
				transactionPda: p.transactionPda,
				status: p.status,
				creator: p.creator,
				createdAt: p.createdAt.toISOString(),
				executedAt: p.executedAt?.toISOString() ?? null,
				instructions: p.instructions,
			}));

			this.send(res, dto, 200);
		} catch (e) {
			next(e);
		}
	}
}

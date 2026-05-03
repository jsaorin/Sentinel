import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";
import {
	DOMAIN_TYPES,
	type IProposalRepository,
	type IRealtimeService,
	type ISquadsService,
	ProposalStatus,
	type UpdateProposalData,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	ReconcileProposalCommandInputDto,
	ReconcileProposalCommandOutputDto,
} from "../dtos/ReconcileProposalCommandDto.js";

const SQUADS_STATUS_MAP: Record<string, ProposalStatus> = {
	DRAFT: ProposalStatus.DRAFT,
	ACTIVE: ProposalStatus.ACTIVE,
	APPROVED: ProposalStatus.APPROVED,
	REJECTED: ProposalStatus.REJECTED,
	EXECUTING: ProposalStatus.EXECUTED,
	EXECUTED: ProposalStatus.EXECUTED,
	CANCELLED: ProposalStatus.CANCELLED,
};

@injectable()
@injectFromBase()
export class ReconcileProposalCommandHandler extends BaseUseCase<
	ReconcileProposalCommandInputDto,
	ReconcileProposalCommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.ProposalRepository)
		private proposalRepository: IProposalRepository,
		@inject(DOMAIN_TYPES.SquadsService)
		private squadsService: ISquadsService,
		@inject(DOMAIN_TYPES.RealtimeService)
		private realtime: IRealtimeService,
	) {
		super();
	}

	async execute(
		input: ReconcileProposalCommandInputDto,
	): Promise<ReconcileProposalCommandOutputDto> {
		const { multisigId, multisigAddress, indices, slot } = input;

		if (indices.length === 0) {
			return { updated: 0, missing: [] };
		}

		const dedupedIndices = [...new Set(indices)].sort((a, b) => a - b);

		this.logger.info("Reconciling proposals", {
			multisigId,
			indices: dedupedIndices,
		});

		const existing = await this.proposalRepository.findByMultisigIdAndIndices(
			multisigId,
			dedupedIndices,
		);
		const existingByIndex = new Map(existing.map((p) => [p.proposalIndex, p]));

		const minIndex = dedupedIndices[0];
		const maxIndex = dedupedIndices[dedupedIndices.length - 1];

		const onChain = await this.squadsService.getProposals(
			multisigAddress,
			maxIndex,
			minIndex,
			slot,
		);
		const onChainByIndex = new Map(onChain.map((p) => [p.proposalIndex, p]));

		const missing: number[] = [];
		let updated = 0;

		for (const idx of dedupedIndices) {
			const stored = existingByIndex.get(idx);
			const fresh = onChainByIndex.get(idx);

			if (!stored) {
				missing.push(idx);
				continue;
			}
			if (!fresh) continue;

			const update = this.diff(stored, fresh);
			if (!update) continue;

			const next = await this.proposalRepository.update(stored.id, update);
			updated++;

			const payload = {
				proposalId: next.id,
				multisigId: next.multisigId,
				status: next.status,
				approverCount: next.approvers.length,
				rejecterCount: next.rejecters.length,
			};

			await this.realtime.emitToRoom(
				REALTIME_ROOMS.proposal(next.id),
				REALTIME_ACTIONS.PROPOSAL_UPDATED,
				payload,
			);
			await this.realtime.emitToRoom(
				REALTIME_ROOMS.multisig(multisigId),
				REALTIME_ACTIONS.PROPOSAL_UPDATED,
				payload,
			);
			await this.realtime.emitToRoom(
				REALTIME_ROOMS.watcherFeed(),
				REALTIME_ACTIONS.PROPOSAL_UPDATED,
				payload,
			);
		}

		this.logger.info("Reconciliation done", {
			multisigId,
			updated,
			missingCount: missing.length,
		});

		return { updated, missing };
	}

	private diff(
		stored: {
			status: ProposalStatus;
			approvers: readonly string[];
			rejecters: readonly string[];
			cancellers: readonly string[];
			executedAt: Date | null;
		},
		fresh: {
			status: string;
			approvers: string[];
			rejecters: string[];
			cancellers: string[];
			executedAt: Date | null;
		},
	): UpdateProposalData | null {
		const update: UpdateProposalData = {};
		let changed = false;

		const freshStatus = SQUADS_STATUS_MAP[fresh.status] ?? ProposalStatus.DRAFT;
		if (stored.status !== freshStatus) {
			update.status = freshStatus;
			changed = true;
		}
		if (!sameSet(stored.approvers, fresh.approvers)) {
			update.approvers = fresh.approvers;
			changed = true;
		}
		if (!sameSet(stored.rejecters, fresh.rejecters)) {
			update.rejecters = fresh.rejecters;
			changed = true;
		}
		if (!sameSet(stored.cancellers, fresh.cancellers)) {
			update.cancellers = fresh.cancellers;
			changed = true;
		}
		if (!sameTime(stored.executedAt, fresh.executedAt)) {
			update.executedAt = fresh.executedAt;
			changed = true;
		}

		return changed ? update : null;
	}
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
	if (a.length !== b.length) return false;
	const set = new Set(a);
	for (const item of b) if (!set.has(item)) return false;
	return true;
}

function sameTime(a: Date | null, b: Date | null): boolean {
	if (a === null && b === null) return true;
	if (a === null || b === null) return false;
	return a.getTime() === b.getTime();
}

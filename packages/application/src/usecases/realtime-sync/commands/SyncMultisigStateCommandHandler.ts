import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";
import type { MultisigConfigChanges } from "@sentinel/common/realtime";
import {
	DOMAIN_TYPES,
	type IMultisigRepository,
	type IProposalRepository,
	type IRealtimeService,
	type ISignerRepository,
	type ISquadsService,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { APPLICATION_TYPES } from "../../../types.js";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type { IngestNewProposalsCommandHandler } from "../../multisigs/commands/IngestNewProposalsCommandHandler.js";
import type { ScoreMultisigHealthCommandHandler } from "../../scoring/commands/ScoreMultisigHealthCommandHandler.js";
import type {
	SyncMultisigStateCommandInputDto,
	SyncMultisigStateCommandOutputDto,
} from "../dtos/SyncMultisigStateCommandDto.js";
import type { ReconcileProposalCommandHandler } from "./ReconcileProposalCommandHandler.js";

const RECONCILE_WINDOW = 5;

@injectable()
@injectFromBase()
export class SyncMultisigStateCommandHandler extends BaseUseCase<
	SyncMultisigStateCommandInputDto,
	SyncMultisigStateCommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.SignerRepository)
		private signerRepository: ISignerRepository,
		@inject(DOMAIN_TYPES.ProposalRepository)
		private proposalRepository: IProposalRepository,
		@inject(DOMAIN_TYPES.SquadsService)
		private squadsService: ISquadsService,
		@inject(DOMAIN_TYPES.RealtimeService)
		private realtime: IRealtimeService,
		@inject(APPLICATION_TYPES.IngestNewProposalsCommandHandler)
		private ingestNewProposalsHandler: IngestNewProposalsCommandHandler,
		@inject(APPLICATION_TYPES.ReconcileProposalCommandHandler)
		private reconcileProposalHandler: ReconcileProposalCommandHandler,
		@inject(APPLICATION_TYPES.ScoreMultisigHealthCommandHandler)
		private scoreMultisigHealthHandler: ScoreMultisigHealthCommandHandler,
	) {
		super();
	}

	async execute(
		input: SyncMultisigStateCommandInputDto,
	): Promise<SyncMultisigStateCommandOutputDto> {
		const { multisigAddress, kind, proposalPda } = input;

		const multisig =
			await this.multisigRepository.findByAddress(multisigAddress);
		if (!multisig) {
			this.logger.warning("Sync skipped: multisig not tracked", {
				multisigAddress,
				kind,
			});
			return {
				skipped: true,
				configChanged: false,
				proposalsCreated: 0,
				proposalsUpdated: 0,
			};
		}

		this.logger.info("Syncing multisig state", {
			multisigId: multisig.id,
			multisigAddress,
			kind,
			proposalPda,
		});

		let configChanged = false;
		let proposalsCreated = 0;
		let proposalsUpdated = 0;

		const runConfig = kind === "config-change" || kind === "unknown";
		const runProposals = kind === "proposal-action" || kind === "unknown";

		if (runConfig) {
			configChanged = await this.syncConfig(multisig.id, multisigAddress);
		}

		if (runProposals) {
			const accountData =
				await this.squadsService.getMultisigAccountData(multisigAddress);
			const ingest = await this.ingestNewProposalsHandler.execute({
				multisigId: multisig.id,
				address: multisigAddress,
				transactionIndex: accountData.transactionIndex,
			});
			proposalsCreated = ingest.newProposals.length;

			for (const np of ingest.newProposals) {
				const payload = {
					proposalId: np.id,
					multisigId: np.multisigId,
					proposalIndex: np.proposalIndex,
				};
				await this.realtime.emitToRoom(
					REALTIME_ROOMS.multisig(np.multisigId),
					REALTIME_ACTIONS.NEW_PROPOSAL,
					payload,
				);
				await this.realtime.emitToRoom(
					REALTIME_ROOMS.watcherFeed(),
					REALTIME_ACTIONS.NEW_PROPOSAL,
					payload,
				);
			}

			const latest = await this.proposalRepository.findLatestByMultisigId(
				multisig.id,
			);
			if (latest) {
				const newIndices = new Set(
					ingest.newProposals.map((p) => p.proposalIndex),
				);
				const windowStart = Math.max(
					1,
					latest.proposalIndex - RECONCILE_WINDOW + 1,
				);
				const indices: number[] = [];
				for (let i = windowStart; i <= latest.proposalIndex; i++) {
					if (!newIndices.has(i)) indices.push(i);
				}
				if (indices.length > 0) {
					const result = await this.reconcileProposalHandler.execute({
						multisigId: multisig.id,
						multisigAddress,
						indices,
					});
					proposalsUpdated = result.updated;
				}
			}
		}

		this.logger.info("Sync done", {
			multisigId: multisig.id,
			configChanged,
			proposalsCreated,
			proposalsUpdated,
		});

		return {
			skipped: false,
			configChanged,
			proposalsCreated,
			proposalsUpdated,
		};
	}

	private async syncConfig(
		multisigId: string,
		multisigAddress: string,
	): Promise<boolean> {
		const accountData =
			await this.squadsService.getMultisigAccountData(multisigAddress);

		const current = await this.multisigRepository.findById(multisigId);
		if (!current) return false;

		const beforeSigners = (
			await this.signerRepository.findByMultisigId(multisigId)
		).map((s) => s.address);
		const afterSigners = accountData.members.map((m) => m.address);

		const thresholdChanged = current.threshold !== accountData.threshold;
		const authorityChanged =
			current.configAuthority !== accountData.configAuthority;
		const signersDiff = diffSigners(beforeSigners, afterSigners);
		const signersChanged =
			signersDiff.added.length > 0 || signersDiff.removed.length > 0;

		if (thresholdChanged || authorityChanged) {
			await this.multisigRepository.update(multisigId, {
				threshold: accountData.threshold,
				configAuthority: accountData.configAuthority,
			});
		}

		if (signersChanged) {
			await this.signerRepository.deleteByMultisigId(multisigId);
			await this.signerRepository.createMany(
				accountData.members.map((m) => ({
					address: m.address,
					multisigId,
					permissions: m.permissions,
				})),
			);
		}

		const anythingChanged =
			thresholdChanged || authorityChanged || signersChanged;
		if (!anythingChanged) return false;

		await this.scoreMultisigHealthHandler.execute({ multisigId });

		const changes: MultisigConfigChanges = {};
		if (thresholdChanged) {
			changes.threshold = {
				from: current.threshold,
				to: accountData.threshold,
			};
		}
		if (authorityChanged) {
			changes.configAuthority = {
				from: current.configAuthority,
				to: accountData.configAuthority,
			};
		}
		if (signersDiff.added.length > 0) changes.signersAdded = signersDiff.added;
		if (signersDiff.removed.length > 0)
			changes.signersRemoved = signersDiff.removed;

		const payload = { multisigId, changes };
		await this.realtime.emitToRoom(
			REALTIME_ROOMS.multisig(multisigId),
			REALTIME_ACTIONS.MULTISIG_CONFIG_CHANGED,
			payload,
		);
		await this.realtime.emitToRoom(
			REALTIME_ROOMS.watcherFeed(),
			REALTIME_ACTIONS.MULTISIG_CONFIG_CHANGED,
			payload,
		);

		return true;
	}
}

function diffSigners(
	before: string[],
	after: string[],
): { added: string[]; removed: string[] } {
	const beforeSet = new Set(before);
	const afterSet = new Set(after);
	return {
		added: after.filter((s) => !beforeSet.has(s)),
		removed: before.filter((s) => !afterSet.has(s)),
	};
}

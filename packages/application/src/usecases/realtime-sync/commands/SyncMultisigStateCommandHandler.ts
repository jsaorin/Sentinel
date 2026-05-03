import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";
import type { MultisigConfigChanges } from "@sentinel/common/realtime";
import {
	DOMAIN_TYPES,
	type IHeliusWebhookService,
	type IMultisigRepository,
	type IProposalRepository,
	type IRealtimeService,
	type ISignerRepository,
	type ISquadsService,
	WebhookType,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { APPLICATION_TYPES } from "../../../types.js";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type { IngestNewProposalsCommandHandler } from "../../multisigs/commands/IngestNewProposalsCommandHandler.js";
import type { ScoreMultisigHealthCommandHandler } from "../../scoring/commands/ScoreMultisigHealthCommandHandler.js";
import type { ScanSignerNoncesCommandHandler } from "../../security/commands/ScanSignerNoncesCommandHandler.js";
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
		@inject(APPLICATION_TYPES.ScanSignerNoncesCommandHandler)
		private scanSignerNoncesHandler: ScanSignerNoncesCommandHandler,
		@inject(DOMAIN_TYPES.HeliusWebhookService)
		private heliusWebhookService: IHeliusWebhookService,
	) {
		super();
	}

	async execute(
		input: SyncMultisigStateCommandInputDto,
	): Promise<SyncMultisigStateCommandOutputDto> {
		const { multisigAddress, kind, proposalPda, slot } = input;

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
			configChanged = await this.syncConfig(multisig.id, multisigAddress, slot);
		}

		if (runProposals) {
			const accountData = await this.squadsService.getMultisigAccountData(
				multisigAddress,
				slot,
			);
			const ingest = await this.ingestNewProposalsHandler.execute({
				multisigId: multisig.id,
				address: multisigAddress,
				transactionIndex: accountData.transactionIndex,
				slot,
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
						slot,
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
		slot?: number,
	): Promise<boolean> {
		const accountData = await this.squadsService.getMultisigAccountData(
			multisigAddress,
			slot,
		);

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

			// For every signer that just joined the multisig:
			//   1. Subscribe their address to the Helius MULTISIG_ACTIVITY webhook so
			//      we get real-time visibility on any tx involving them (catches
			//      AdvanceNonceAccount where authority = signer at consumption time).
			//   2. Run a one-shot getProgramAccounts scan to detect any pre-existing
			//      Durable Nonce account where authority = signer. This is the early
			//      warning signal of a Drift-style attack staging.
			const addedSet = new Set(signersDiff.added);
			if (addedSet.size > 0) {
				const allSigners =
					await this.signerRepository.findByMultisigId(multisigId);
				const newlyAdded = allSigners.filter((s) => addedSet.has(s.address));
				for (const signer of newlyAdded) {
					try {
						await this.heliusWebhookService.addAddressToWebhook(
							signer.address,
							WebhookType.MULTISIG_ACTIVITY,
						);
					} catch (err) {
						this.logger.warning("nonce:signer-webhook-register-failed", {
							signerAddress: signer.address,
							err: (err as Error).message,
						});
					}
					try {
						await this.scanSignerNoncesHandler.execute({
							multisigId,
							signerId: signer.id,
							signerAddress: signer.address,
						});
					} catch (err) {
						this.logger.warning("nonce:signer-initial-scan-failed", {
							signerAddress: signer.address,
							err: (err as Error).message,
						});
					}
				}
			}
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

import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";
import {
	DOMAIN_TYPES,
	type IMultisigRepository,
	type INonceAccountRepository,
	type IRealtimeService,
	type ISignerRepository,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { APPLICATION_TYPES } from "../../../types.js";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type { ScoreMultisigHealthCommandHandler } from "../../scoring/commands/ScoreMultisigHealthCommandHandler.js";
import type {
	IngestDetectedNonceCommandInputDto,
	IngestDetectedNonceCommandOutputDto,
} from "../dtos/IngestDetectedNonceCommandDto.js";

@injectable()
@injectFromBase()
export class IngestDetectedNonceCommandHandler extends BaseUseCase<
	IngestDetectedNonceCommandInputDto,
	IngestDetectedNonceCommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.NonceAccountRepository)
		private readonly repository: INonceAccountRepository,
		@inject(DOMAIN_TYPES.SignerRepository)
		private readonly signerRepository: ISignerRepository,
		@inject(DOMAIN_TYPES.MultisigRepository)
		private readonly multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.RealtimeService)
		private readonly realtime: IRealtimeService,
		@inject(APPLICATION_TYPES.ScoreMultisigHealthCommandHandler)
		private readonly scoreMultisigHealthHandler: ScoreMultisigHealthCommandHandler,
	) {
		super();
	}

	async execute(
		input: IngestDetectedNonceCommandInputDto,
	): Promise<IngestDetectedNonceCommandOutputDto> {
		const { address, authority, fundedBy } = input;

		// Find which signer/multisig this authority belongs to. The subscription
		// only delivers events whose authority is registered, but we still need
		// the FK for persistence.
		const signers = await this.signerRepository.findByAddress(authority);
		if (signers.length === 0) {
			this.logger.debug("nonce:ingest:unknown-authority", { authority });
			return {
				persistedId: null,
				skipped: true,
				skipReason: "unknown-authority",
			};
		}

		// A pubkey can theoretically be a signer of multiple multisigs. Persist
		// one row per (signer, multisig) so downstream scoring sees the warning
		// in every affected multisig.
		const existing = await this.repository.findExistingAddresses([address]);
		if (existing.has(address)) {
			return { persistedId: null, skipped: true, skipReason: "already-known" };
		}

		const trustedFundersByMultisig = new Map<string, Set<string>>();
		for (const signer of signers) {
			const trusted = await this.collectTrustedFunders(signer.multisigId);
			trustedFundersByMultisig.set(signer.multisigId, trusted);
		}

		const created = await this.repository.createMany(
			signers.map((signer) => {
				const trusted =
					trustedFundersByMultisig.get(signer.multisigId) ?? new Set();
				return {
					address,
					authority,
					fundedBy,
					multisigId: signer.multisigId,
					signerId: signer.id,
					externallyFunded: fundedBy ? !trusted.has(fundedBy) : true,
				};
			}),
		);

		const externallyFundedCount = created.filter(
			(n) => n.externallyFunded,
		).length;
		this.logger.warning("nonce:ingest:detected", {
			address,
			authority,
			fundedBy,
			affectedMultisigs: created.length,
			externallyFundedCount,
		});

		// Realtime alert + multisig health rescore per affected multisig.
		for (const n of created) {
			const payload = {
				multisigId: n.multisigId,
				signerAddress: authority,
				nonceAddress: address,
				fundedBy,
				externallyFunded: n.externallyFunded,
				severity: n.externallyFunded
					? ("CRITICAL" as const)
					: ("WARNING" as const),
			};
			await this.realtime.emitToRoom(
				REALTIME_ROOMS.multisig(n.multisigId),
				REALTIME_ACTIONS.NONCE_ACCOUNT_DETECTED,
				payload,
			);
			await this.realtime.emitToRoom(
				REALTIME_ROOMS.watcherFeed(),
				REALTIME_ACTIONS.NONCE_ACCOUNT_DETECTED,
				payload,
			);
			try {
				await this.scoreMultisigHealthHandler.execute({
					multisigId: n.multisigId,
				});
			} catch (err) {
				this.logger.warning("nonce:ingest:rescore-failed", {
					multisigId: n.multisigId,
					err: (err as Error).message,
				});
			}
		}

		return {
			persistedId: created[0]?.id ?? null,
			skipped: false,
		};
	}

	private async collectTrustedFunders(
		multisigId: string,
	): Promise<Set<string>> {
		const set = new Set<string>();
		const multisig = await this.multisigRepository.findById(multisigId);
		if (multisig) set.add(multisig.address);
		const signers = await this.signerRepository.findByMultisigId(multisigId);
		for (const s of signers) set.add(s.address);
		return set;
	}
}

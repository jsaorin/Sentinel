import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";
import {
	DOMAIN_TYPES,
	type IMultisigRepository,
	type INonceAccountRepository,
	type INonceAccountScanner,
	type IRealtimeService,
	type ISignerRepository,
} from "@sentinel/domain";
import { inject, injectFromBase, injectable } from "inversify";
import { BaseUseCase } from "../../base/BaseUseCase.js";
import type {
	DetectedNonceAccount,
	ScanSignerNoncesCommandInputDto,
	ScanSignerNoncesCommandOutputDto,
} from "../dtos/ScanSignerNoncesCommandDto.js";

@injectable()
@injectFromBase()
export class ScanSignerNoncesCommandHandler extends BaseUseCase<
	ScanSignerNoncesCommandInputDto,
	ScanSignerNoncesCommandOutputDto
> {
	constructor(
		@inject(DOMAIN_TYPES.NonceAccountScanner)
		private scanner: INonceAccountScanner,
		@inject(DOMAIN_TYPES.NonceAccountRepository)
		private repository: INonceAccountRepository,
		@inject(DOMAIN_TYPES.MultisigRepository)
		private multisigRepository: IMultisigRepository,
		@inject(DOMAIN_TYPES.SignerRepository)
		private signerRepository: ISignerRepository,
		@inject(DOMAIN_TYPES.RealtimeService)
		private realtime: IRealtimeService,
	) {
		super();
	}

	async execute(
		input: ScanSignerNoncesCommandInputDto,
	): Promise<ScanSignerNoncesCommandOutputDto> {
		const { multisigId, signerId, signerAddress } = input;

		const onChain = await this.scanner.scanForAuthority(signerAddress);
		if (onChain.length === 0) {
			return {
				scannedSignerAddress: signerAddress,
				totalNonceCount: 0,
				newNonceCount: 0,
				newNonces: [],
			};
		}

		const knownAddresses = await this.repository.findExistingAddresses(
			onChain.map((s) => s.address),
		);

		const newOnChain = onChain.filter((s) => !knownAddresses.has(s.address));
		if (newOnChain.length === 0) {
			return {
				scannedSignerAddress: signerAddress,
				totalNonceCount: onChain.length,
				newNonceCount: 0,
				newNonces: [],
			};
		}

		// Resolve "external funder" against the multisig's full set of trusted
		// addresses: all current signers + the multisig PDA itself.
		const multisig = await this.multisigRepository.findById(multisigId);
		const signers = await this.signerRepository.findByMultisigId(multisigId);
		const trustedFunders = new Set<string>();
		if (multisig) trustedFunders.add(multisig.address);
		for (const s of signers) trustedFunders.add(s.address);

		const created = await this.repository.createMany(
			newOnChain.map((s) => ({
				address: s.address,
				authority: s.authority,
				fundedBy: s.fundedBy,
				multisigId,
				signerId,
				externallyFunded: s.fundedBy ? !trustedFunders.has(s.fundedBy) : true,
			})),
		);

		const newNonces: DetectedNonceAccount[] = created.map((n) => ({
			id: n.id,
			address: n.address,
			authority: n.authority,
			fundedBy: n.fundedBy,
			externallyFunded: n.externallyFunded,
		}));

		this.logger.warning("nonce:scan:new-nonces-detected", {
			signerAddress,
			multisigId,
			count: newNonces.length,
			externallyFundedCount: newNonces.filter((n) => n.externallyFunded).length,
		});

		// Realtime alert per nonce detected. CRITICAL severity for externally
		// funded nonces (= Drift-style attack pre-staging signal).
		for (const n of created) {
			const payload = {
				multisigId,
				signerAddress,
				nonceAddress: n.address,
				fundedBy: n.fundedBy,
				externallyFunded: n.externallyFunded,
				severity: n.externallyFunded
					? ("CRITICAL" as const)
					: ("WARNING" as const),
			};
			await this.realtime.emitToRoom(
				REALTIME_ROOMS.multisig(multisigId),
				REALTIME_ACTIONS.NONCE_ACCOUNT_DETECTED,
				payload,
			);
			await this.realtime.emitToRoom(
				REALTIME_ROOMS.watcherFeed(),
				REALTIME_ACTIONS.NONCE_ACCOUNT_DETECTED,
				payload,
			);
		}

		return {
			scannedSignerAddress: signerAddress,
			totalNonceCount: onChain.length,
			newNonceCount: created.length,
			newNonces,
		};
	}
}

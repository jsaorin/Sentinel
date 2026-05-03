import {
	APPLICATION_TYPES,
	type IngestDetectedNonceCommandHandler,
} from "@sentinel/application";
import type { ILogger } from "@sentinel/common/logger";
import {
	DOMAIN_TYPES,
	type INonceAccountSubscriber,
	type ISignerRepository,
	type NonceAccountMatchEvent,
} from "@sentinel/domain";
import type { Container } from "inversify";

/**
 * Boots and tears down the LaserStream gRPC nonce subscriber. On `start()`:
 *   1. Reads every distinct signer address from the DB
 *   2. Calls `subscriber.start(authorities, onMatch)`
 *   3. Each match is forwarded to `IngestDetectedNonceCommandHandler` which
 *      persists, scores, and emits realtime alert
 *
 * Replaces the old polling-based MultisigNonceScanScheduler. Polling against
 * SystemProgram via JSON-RPC is rejected by every major provider (Helius,
 * Alchemy free tier) — gRPC stream-filter is the only viable mechanism.
 */
export class NonceSubscriberLifecycle {
	constructor(private readonly container: Container) {}

	async start(): Promise<void> {
		const logger = this.container.get<ILogger>(APPLICATION_TYPES.Logger);
		const subscriber = this.container.get<INonceAccountSubscriber>(
			DOMAIN_TYPES.NonceAccountSubscriber,
		);
		const signerRepository = this.container.get<ISignerRepository>(
			DOMAIN_TYPES.SignerRepository,
		);
		const ingest = this.container.get<IngestDetectedNonceCommandHandler>(
			APPLICATION_TYPES.IngestDetectedNonceCommandHandler,
		);

		const authorities = await signerRepository.findAllAddresses();
		logger.info("nonce-lifecycle:starting", {
			authorityCount: authorities.length,
		});

		await subscriber.start(
			authorities,
			async (event: NonceAccountMatchEvent) => {
				try {
					await ingest.execute({
						address: event.address,
						authority: event.authority,
						fundedBy: event.fundedBy,
					});
				} catch (err) {
					logger.error("nonce-lifecycle:ingest-failed", {
						address: event.address,
						authority: event.authority,
						err: (err as Error).message,
					});
				}
			},
		);
	}

	async stop(): Promise<void> {
		const subscriber = this.container.get<INonceAccountSubscriber>(
			DOMAIN_TYPES.NonceAccountSubscriber,
		);
		await subscriber.stop();
	}
}

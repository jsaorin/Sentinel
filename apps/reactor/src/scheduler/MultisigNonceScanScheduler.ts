// TODO(geyser-migration): replace polling with Geyser/LaserStream gRPC
// subscription. Polling does not scale beyond a few hundred signers; gRPC
// push gives sub-second latency and constant cost. See plan file
// "Detector de Durable Nonce accounts apuntando a signers trackeados".
import {
	APPLICATION_TYPES,
	type IOutboxEventPublisher,
} from "@sentinel/application";
import type { ILogger } from "@sentinel/common/logger";
import { DOMAIN_TYPES, type IMultisigRepository } from "@sentinel/domain";
import type { Container } from "inversify";

const ROUTING_KEY = "multisig.scan.nonces.requested";
const EVENT_TYPE = "multisig.scan.nonces.requested";

export class MultisigNonceScanScheduler {
	private timer: NodeJS.Timeout | null = null;
	private inFlight = false;

	constructor(
		private readonly container: Container,
		private readonly intervalMs: number,
	) {}

	start(): void {
		const logger = this.container.get<ILogger>(APPLICATION_TYPES.Logger);
		if (this.timer) {
			logger.warning("nonce-scheduler:already-started");
			return;
		}
		logger.info("nonce-scheduler:started", { intervalMs: this.intervalMs });

		// Tick once on start so we don't wait the full interval before the first scan.
		// `void` because we don't want to block the reactor startup on the first tick.
		void this.tick();

		this.timer = setInterval(() => {
			void this.tick();
		}, this.intervalMs);
	}

	stop(): void {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	private async tick(): Promise<void> {
		const logger = this.container.get<ILogger>(APPLICATION_TYPES.Logger);
		if (this.inFlight) {
			logger.debug("nonce-scheduler:tick-skipped-in-flight");
			return;
		}
		this.inFlight = true;
		try {
			const multisigRepository = this.container.get<IMultisigRepository>(
				DOMAIN_TYPES.MultisigRepository,
			);
			const publisher = this.container.get<IOutboxEventPublisher>(
				APPLICATION_TYPES.OutboxEventPublisher,
			);
			const multisigs = await multisigRepository.findAll();
			logger.info("nonce-scheduler:tick", { multisigCount: multisigs.length });

			for (const m of multisigs) {
				await publisher.publish(
					{
						id: crypto.randomUUID(),
						type: EVENT_TYPE,
						time: new Date().toISOString(),
						data: { multisigAddress: m.address },
					},
					{ routingKey: ROUTING_KEY },
				);
			}
		} catch (err) {
			logger.error("nonce-scheduler:tick-error", {
				err: (err as Error).message,
			});
		} finally {
			this.inFlight = false;
		}
	}
}

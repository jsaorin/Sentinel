import "reflect-metadata";
import { APPLICATION_TYPES, type InboxStore } from "@sentinel/application";
import type { ILogger } from "@sentinel/common/logger";
import { reactorConfig } from "./config/index.js";
import { container } from "./inversify.config.js";
import { Subscriber } from "./messaging/subscriber.js";
import { ReactorServer } from "./server/ReactorServer.js";
import { subscriptions } from "./subscriptions/index.js";

class ReactorApp {
	private subscriber: Subscriber | null = null;
	private server: ReactorServer | null = null;
	private redis: InboxStore | null = null;

	async start(): Promise<void> {
		const logger = container.get<ILogger>(APPLICATION_TYPES.Logger);

		// Warm-up Redis
		try {
			this.redis = container.get<InboxStore>(APPLICATION_TYPES.InboxStore);
			await this.redis.ping();
			logger.info("redis:connected");
		} catch (e) {
			logger.error("redis:connection-failed", { err: (e as Error).message });
			throw e;
		}

		// Start the subscriber
		this.subscriber = new Subscriber(
			{
				url: reactorConfig.amqpUrl,
				exchangeDefault: reactorConfig.exchangeDefault,
				prefetch: reactorConfig.prefetch,
				manualAck: reactorConfig.manualAck,
			},
			logger,
			container,
		);

		await this.subscriber.connect();
		await this.subscriber.bind(subscriptions);

		// Start health server
		this.server = new ReactorServer(
			logger,
			this.subscriber,
			this.redis,
			reactorConfig.reactorPort,
		);
		await this.server.start();

		logger.info("Sentinel Reactor started", {
			env: process.env.NODE_ENV,
			subscriptions: subscriptions.length,
		});
	}

	async shutdown(): Promise<void> {
		const logger = container.get<ILogger>(APPLICATION_TYPES.Logger);

		try {
			if (this.subscriber) {
				await this.subscriber.stop({ drainMs: 10_000 });
			}
		} catch (e) {
			logger.error("reactor:stop-error", { err: (e as Error).message });
		}

		try {
			if (this.server) {
				await this.server.stop();
			}
		} catch (e) {
			logger.error("health-server:stop-error", { err: (e as Error).message });
		}

		try {
			if (this.redis) {
				await this.redis.close();
				logger.info("redis:closed");
			}
		} catch (e) {
			logger.error("redis:close-error", { err: (e as Error).message });
		}

		logger.info("reactor:shutdown-complete");
	}
}

export default ReactorApp;

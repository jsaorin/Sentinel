import "reflect-metadata";
import { APPLICATION_TYPES } from "@sentinel/application";
import type { ILogger } from "@sentinel/common/logger";
import {
	INFRASTRUCTURE_TYPES,
	type TelegramWatcherService,
} from "@sentinel/infrastructure";
import { container } from "./inversify.config.js";

class WatcherApp {
	private telegramWatcher: TelegramWatcherService | null = null;

	async start(): Promise<void> {
		const logger = container.get<ILogger>(APPLICATION_TYPES.Logger);

		this.telegramWatcher = container.get<TelegramWatcherService>(
			INFRASTRUCTURE_TYPES.TelegramWatcherService,
		);

		await this.telegramWatcher.start();

		logger.info("Sentinel Watcher started", {
			env: process.env.NODE_ENV,
		});
	}

	async shutdown(): Promise<void> {
		const logger = container.get<ILogger>(APPLICATION_TYPES.Logger);

		try {
			if (this.telegramWatcher) {
				await this.telegramWatcher.stop();
			}
		} catch (e) {
			logger.error("watcher:stop-error", { err: (e as Error).message });
		}

		logger.info("watcher:shutdown-complete");
	}
}

export default WatcherApp;

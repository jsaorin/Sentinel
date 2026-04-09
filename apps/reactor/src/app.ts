import "reflect-metadata";
import { APPLICATION_TYPES } from "@sentinel/application";
import type { ILogger } from "@sentinel/common/logger";
import { container } from "./inversify.config.js";

class ReactorApp {
	async start(): Promise<void> {
		const logger = container.get<ILogger>(APPLICATION_TYPES.Logger);

		logger.info("Sentinel Reactor started", {
			env: process.env.NODE_ENV,
		});
	}

	async shutdown(): Promise<void> {
		const logger = container.get<ILogger>(APPLICATION_TYPES.Logger);
		logger.info("reactor:shutdown-complete");
	}
}

export default ReactorApp;

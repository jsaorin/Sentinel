import { APPLICATION_TYPES } from "@sentinel/application";
import type { EventPublisherConfig } from "@sentinel/application";
import type { ILogger } from "@sentinel/common/logger";
import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { logger } from "../../logger/logger.js";

export const configBindings = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		options.bind<ILogger>(APPLICATION_TYPES.Logger).toConstantValue(logger);

		options
			.bind<EventPublisherConfig>(APPLICATION_TYPES.EventPublisherConfig)
			.toConstantValue({
				url: "",
				exchangeName: "reactor.events",
				exchangeType: "topic",
				confirmTimeoutMs: 5000,
				appId: "webhooks",
			});
	},
);

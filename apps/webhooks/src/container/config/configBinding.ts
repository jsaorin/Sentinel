import { APPLICATION_TYPES } from "@sentinel/application";
import type { EventPublisherConfig } from "@sentinel/application";
import type { ILogger } from "@sentinel/common/logger";
import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import environment from "../../env/webhooks-environment.js";
import { logger } from "../../logger/logger.js";

export const configBindings = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		options.bind<ILogger>(APPLICATION_TYPES.Logger).toConstantValue(logger);

		options
			.bind<EventPublisherConfig>(APPLICATION_TYPES.EventPublisherConfig)
			.toConstantValue({
				url: environment.amqpUrl,
				exchangeName: "reactor.events",
				exchangeType: "topic",
				confirmTimeoutMs: 5000,
				appId: environment.appName,
			});
	},
);

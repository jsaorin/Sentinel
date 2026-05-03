import { APPLICATION_TYPES } from "@sentinel/application";
import type { EventPublisherConfig } from "@sentinel/application";
import type { ILogger } from "@sentinel/common/logger";
import { DOMAIN_TYPES } from "@sentinel/domain";
import { INFRASTRUCTURE_TYPES } from "@sentinel/infrastructure";
import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import environment from "../../env/reactor-environment.js";
import { logger } from "../../logger/logger.js";

export const configModule = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		options.bind<ILogger>(APPLICATION_TYPES.Logger).toConstantValue(logger);

		options
			.bind<EventPublisherConfig>(APPLICATION_TYPES.EventPublisherConfig)
			.toConstantValue({
				url: environment.amqpUrl,
				exchangeName: "reactor.events",
				exchangeType: "topic",
				confirmTimeoutMs: 5000,
				appId: "reactor",
			});

		options
			.bind<string>(INFRASTRUCTURE_TYPES.RabbitMqUrl)
			.toConstantValue(environment.amqpUrl);

		options.bind(DOMAIN_TYPES.RedisConfig).toConstantValue({
			host: environment.redisHost,
			port: environment.redisPort,
		});

		options
			.bind(DOMAIN_TYPES.HeliusApiConfig)
			.toConstantValue({ apiKey: environment.heliusApiKey });

		options.bind(DOMAIN_TYPES.LaserStreamConfig).toConstantValue({
			endpoint: environment.alchemyGrpcEndpoint,
			token: environment.alchemyGrpcToken,
			heliusApiKey: environment.heliusApiKey,
		});

		options.bind(DOMAIN_TYPES.GroqApiConfig).toConstantValue({
			apiKey: environment.groqApiKey,
			model: environment.groqModel,
			dryRun: environment.groqDryRun,
		});
	},
);

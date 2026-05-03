import { APPLICATION_TYPES } from "@sentinel/application";
import type { EventPublisherConfig } from "@sentinel/application";
import type { ILogger } from "@sentinel/common/logger";
import { DOMAIN_TYPES } from "@sentinel/domain";
import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import environment from "../../env/api-environment.js";
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

		options.bind(DOMAIN_TYPES.RedisConfig).toConstantValue({
			host: environment.redisHost,
			port: environment.redisPort,
		});

		options
			.bind(DOMAIN_TYPES.HeliusApiConfig)
			.toConstantValue({ apiKey: environment.heliusApiKey });

		// LaserStream subscriber is only actively used by the reactor, but the
		// Sync handler depends on it so we provide a config binding here too.
		// The api never resolves the subscriber in practice (no endpoint pulls
		// SyncMultisigStateCommandHandler), so an empty token is safe.
		options.bind(DOMAIN_TYPES.LaserStreamConfig).toConstantValue({
			endpoint: "https://solana-mainnet.g.alchemy.com",
			token: "",
			heliusApiKey: environment.heliusApiKey,
		});

		options.bind(DOMAIN_TYPES.GroqApiConfig).toConstantValue({
			apiKey: environment.groqApiKey,
			model: environment.groqModel,
			dryRun: environment.groqDryRun,
		});
	},
);

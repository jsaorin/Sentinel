import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { APPLICATION_TYPES } from "../types.js";
import { HealthCheckQueryHandler } from "../usecases/health/queries/HealthCheckQueryHandler.js";
import { SaveWebhookEventCommandHandler } from "../usecases/webhooks/commands/SaveWebhookEventCommandHandler.js";

export const applicationModule = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		const { bind } = options;

		bind(APPLICATION_TYPES.HealthCheckQueryHandler)
			.to(HealthCheckQueryHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.SaveWebhookEventCommandHandler)
			.to(SaveWebhookEventCommandHandler)
			.inSingletonScope();
	},
);

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { APPLICATION_TYPES } from "../types.js";
import { HealthCheckQueryHandler } from "../usecases/health/queries/HealthCheckQueryHandler.js";
import { AnalyzeMultisigCommandHandler } from "../usecases/multisigs/commands/AnalyzeMultisigCommandHandler.js";
import { CreateMultisigCommandHandler } from "../usecases/multisigs/commands/CreateMultisigCommandHandler.js";
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

		bind(APPLICATION_TYPES.CreateMultisigCommandHandler)
			.to(CreateMultisigCommandHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.AnalyzeMultisigCommandHandler)
			.to(AnalyzeMultisigCommandHandler)
			.inSingletonScope();
	},
);

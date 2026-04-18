import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { APPLICATION_TYPES } from "../types.js";
import { HealthCheckQueryHandler } from "../usecases/health/queries/HealthCheckQueryHandler.js";
import { AnalyzeMultisigCommandHandler } from "../usecases/multisigs/commands/AnalyzeMultisigCommandHandler.js";
import { CreateMultisigCommandHandler } from "../usecases/multisigs/commands/CreateMultisigCommandHandler.js";
import { GetMultisigQueryHandler } from "../usecases/multisigs/queries/GetMultisigQueryHandler.js";
import { ListSignersQueryHandler } from "../usecases/multisigs/queries/ListSignersQueryHandler.js";
import { ListProposalsQueryHandler } from "../usecases/multisigs/queries/ListProposalsQueryHandler.js";
import { SaveWebhookEventCommandHandler } from "../usecases/webhooks/commands/SaveWebhookEventCommandHandler.js";
import { DecodeInstructionsCommandHandler } from "../usecases/instructions/commands/DecodeInstructionsCommandHandler.js";

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

		bind(APPLICATION_TYPES.GetMultisigQueryHandler)
			.to(GetMultisigQueryHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.ListSignersQueryHandler)
			.to(ListSignersQueryHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.ListProposalsQueryHandler)
			.to(ListProposalsQueryHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.DecodeInstructionsCommandHandler)
			.to(DecodeInstructionsCommandHandler)
			.inSingletonScope();
	},
);

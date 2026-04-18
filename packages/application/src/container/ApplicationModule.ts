import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { APPLICATION_TYPES } from "../types.js";
import { HealthCheckQueryHandler } from "../usecases/health/queries/HealthCheckQueryHandler.js";
import { AnalyzeMultisigCommandHandler } from "../usecases/multisigs/commands/AnalyzeMultisigCommandHandler.js";
import { CreateMultisigCommandHandler } from "../usecases/multisigs/commands/CreateMultisigCommandHandler.js";
import { GetMultisigQueryHandler } from "../usecases/multisigs/queries/GetMultisigQueryHandler.js";
import { ListMultisigsQueryHandler } from "../usecases/multisigs/queries/ListMultisigsQueryHandler.js";
import { ListSignersQueryHandler } from "../usecases/multisigs/queries/ListSignersQueryHandler.js";
import { ListProposalsQueryHandler } from "../usecases/multisigs/queries/ListProposalsQueryHandler.js";
import { GetProposalDetailQueryHandler } from "../usecases/proposals/queries/GetProposalDetailQueryHandler.js";
import { SaveWebhookEventCommandHandler } from "../usecases/webhooks/commands/SaveWebhookEventCommandHandler.js";
import { DecodeInstructionsCommandHandler } from "../usecases/instructions/commands/DecodeInstructionsCommandHandler.js";
import { ScoreMultisigHealthCommandHandler } from "../usecases/scoring/commands/ScoreMultisigHealthCommandHandler.js";
import { ScoreProposalsCommandHandler } from "../usecases/scoring/commands/ScoreProposalsCommandHandler.js";
import { SummarizeMultisigAICommandHandler } from "../usecases/ai/commands/SummarizeMultisigAICommandHandler.js";
import { AnalyzeProposalAICommandHandler } from "../usecases/ai/commands/AnalyzeProposalAICommandHandler.js";

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

		bind(APPLICATION_TYPES.ListMultisigsQueryHandler)
			.to(ListMultisigsQueryHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.ListSignersQueryHandler)
			.to(ListSignersQueryHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.ListProposalsQueryHandler)
			.to(ListProposalsQueryHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.GetProposalDetailQueryHandler)
			.to(GetProposalDetailQueryHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.DecodeInstructionsCommandHandler)
			.to(DecodeInstructionsCommandHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.ScoreMultisigHealthCommandHandler)
			.to(ScoreMultisigHealthCommandHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.ScoreProposalsCommandHandler)
			.to(ScoreProposalsCommandHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.SummarizeMultisigAICommandHandler)
			.to(SummarizeMultisigAICommandHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.AnalyzeProposalAICommandHandler)
			.to(AnalyzeProposalAICommandHandler)
			.inSingletonScope();
	},
);

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { APPLICATION_TYPES } from "../types.js";
import { AnalyzeProposalAICommandHandler } from "../usecases/ai/commands/AnalyzeProposalAICommandHandler.js";
import { SummarizeMultisigAICommandHandler } from "../usecases/ai/commands/SummarizeMultisigAICommandHandler.js";
import { HealthCheckQueryHandler } from "../usecases/health/queries/HealthCheckQueryHandler.js";
import { DecodeInstructionsCommandHandler } from "../usecases/instructions/commands/DecodeInstructionsCommandHandler.js";
import { AnalyzeMultisigCommandHandler } from "../usecases/multisigs/commands/AnalyzeMultisigCommandHandler.js";
import { CreateMultisigCommandHandler } from "../usecases/multisigs/commands/CreateMultisigCommandHandler.js";
import { IngestNewProposalsCommandHandler } from "../usecases/multisigs/commands/IngestNewProposalsCommandHandler.js";
import { GetMultisigQueryHandler } from "../usecases/multisigs/queries/GetMultisigQueryHandler.js";
import { ListMultisigsQueryHandler } from "../usecases/multisigs/queries/ListMultisigsQueryHandler.js";
import { ListProposalsQueryHandler } from "../usecases/multisigs/queries/ListProposalsQueryHandler.js";
import { ListSignersQueryHandler } from "../usecases/multisigs/queries/ListSignersQueryHandler.js";
import { GetProposalDetailQueryHandler } from "../usecases/proposals/queries/GetProposalDetailQueryHandler.js";
import { ListProposalsFeedQueryHandler } from "../usecases/proposals/queries/ListProposalsFeedQueryHandler.js";
import { ReconcileProposalCommandHandler } from "../usecases/realtime-sync/commands/ReconcileProposalCommandHandler.js";
import { SyncMultisigStateCommandHandler } from "../usecases/realtime-sync/commands/SyncMultisigStateCommandHandler.js";
import { ScoreMultisigHealthCommandHandler } from "../usecases/scoring/commands/ScoreMultisigHealthCommandHandler.js";
import { ScoreProposalsCommandHandler } from "../usecases/scoring/commands/ScoreProposalsCommandHandler.js";
import { ScanAllMultisigsNoncesCommandHandler } from "../usecases/security/commands/ScanAllMultisigsNoncesCommandHandler.js";
import { ScanMultisigNoncesCommandHandler } from "../usecases/security/commands/ScanMultisigNoncesCommandHandler.js";
import { ScanSignerNoncesCommandHandler } from "../usecases/security/commands/ScanSignerNoncesCommandHandler.js";
import { ListNonceWarningsQueryHandler } from "../usecases/security/queries/ListNonceWarningsQueryHandler.js";
import { AnalyzeThreatSignalCommandHandler } from "../usecases/threat-signals/commands/AnalyzeThreatSignalCommandHandler.js";
import { IngestThreatSignalCommandHandler } from "../usecases/threat-signals/commands/IngestThreatSignalCommandHandler.js";
import { ListThreatSignalsQueryHandler } from "../usecases/threat-signals/queries/ListThreatSignalsQueryHandler.js";
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

		bind(APPLICATION_TYPES.IngestNewProposalsCommandHandler)
			.to(IngestNewProposalsCommandHandler)
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

		bind(APPLICATION_TYPES.ListProposalsFeedQueryHandler)
			.to(ListProposalsFeedQueryHandler)
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

		bind(APPLICATION_TYPES.IngestThreatSignalCommandHandler)
			.to(IngestThreatSignalCommandHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.AnalyzeThreatSignalCommandHandler)
			.to(AnalyzeThreatSignalCommandHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.ListThreatSignalsQueryHandler)
			.to(ListThreatSignalsQueryHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.ReconcileProposalCommandHandler)
			.to(ReconcileProposalCommandHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.SyncMultisigStateCommandHandler)
			.to(SyncMultisigStateCommandHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.ScanSignerNoncesCommandHandler)
			.to(ScanSignerNoncesCommandHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.ScanMultisigNoncesCommandHandler)
			.to(ScanMultisigNoncesCommandHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.ScanAllMultisigsNoncesCommandHandler)
			.to(ScanAllMultisigsNoncesCommandHandler)
			.inSingletonScope();

		bind(APPLICATION_TYPES.ListNonceWarningsQueryHandler)
			.to(ListNonceWarningsQueryHandler)
			.inSingletonScope();
	},
);

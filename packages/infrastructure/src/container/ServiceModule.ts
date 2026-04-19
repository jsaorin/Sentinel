import { DOMAIN_TYPES } from "@sentinel/domain";
import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { HeliusWebhookService } from "../services/HeliusWebhookService.js";
import { SquadsHistoryService } from "../services/SquadsHistoryService.js";
import { SquadsService } from "../services/SquadsService.js";
import { GroqAIAnalysisService } from "../services/ai/GroqAIAnalysisService.js";
import { InstructionDecoderService } from "../services/decoder/InstructionDecoderService.js";
import { OnChainIdlResolverService } from "../services/idl/OnChainIdlResolverService.js";
import { ScoringService } from "../services/scoring/ScoringService.js";

export const serviceModule = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		options
			.bind(DOMAIN_TYPES.HeliusWebhookService)
			.to(HeliusWebhookService)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.SquadsService)
			.to(SquadsService)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.SquadsHistoryService)
			.to(SquadsHistoryService)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.InstructionDecoderService)
			.to(InstructionDecoderService)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.ScoringService)
			.to(ScoringService)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.AIAnalysisService)
			.to(GroqAIAnalysisService)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.IdlResolverService)
			.to(OnChainIdlResolverService)
			.inSingletonScope();
	},
);

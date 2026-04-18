import { DOMAIN_TYPES } from "@sentinel/domain";
import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { HeliusWebhookService } from "../services/HeliusWebhookService.js";
import { SquadsService } from "../services/SquadsService.js";
import { InstructionDecoderService } from "../services/decoder/InstructionDecoderService.js";

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
			.bind(DOMAIN_TYPES.InstructionDecoderService)
			.to(InstructionDecoderService)
			.inSingletonScope();
	},
);

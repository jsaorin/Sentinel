import { DOMAIN_TYPES } from "@sentinel/domain";
import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { HeliusWebhookService } from "../services/HeliusWebhookService.js";

export const serviceModule = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		options
			.bind(DOMAIN_TYPES.HeliusWebhookService)
			.to(HeliusWebhookService)
			.inSingletonScope();
	},
);

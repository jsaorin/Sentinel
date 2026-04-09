import { DOMAIN_TYPES } from "@sentinel/domain";
import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { MultisigRepository } from "../repositories/MultisigRepository.js";
import { OutboxEventRepository } from "../repositories/OutboxEventRepository.js";
import { WebhookConfigRepository } from "../repositories/WebhookConfigRepository.js";

export const repositoryModule = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		options
			.bind(DOMAIN_TYPES.OutboxEventRepository)
			.to(OutboxEventRepository)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.MultisigRepository)
			.to(MultisigRepository)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.WebhookConfigRepository)
			.to(WebhookConfigRepository)
			.inSingletonScope();
	},
);

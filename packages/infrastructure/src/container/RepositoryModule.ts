import { DOMAIN_TYPES } from "@sentinel/domain";
import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { OutboxEventRepository } from "../repositories/OutboxEventRepository.js";

export const repositoryModule = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		options
			.bind(DOMAIN_TYPES.OutboxEventRepository)
			.to(OutboxEventRepository)
			.inSingletonScope();
	},
);

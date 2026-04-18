import { DOMAIN_TYPES } from "@sentinel/domain";
import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { MultisigRepository } from "../repositories/MultisigRepository.js";
import { OutboxEventRepository } from "../repositories/OutboxEventRepository.js";
import { ProposalInstructionRepository } from "../repositories/ProposalInstructionRepository.js";
import { ProposalRepository } from "../repositories/ProposalRepository.js";
import { SignerRepository } from "../repositories/SignerRepository.js";
import { VaultRepository } from "../repositories/VaultRepository.js";
import { DecodedInstructionRepository } from "../repositories/DecodedInstructionRepository.js";
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

		options
			.bind(DOMAIN_TYPES.SignerRepository)
			.to(SignerRepository)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.ProposalRepository)
			.to(ProposalRepository)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.ProposalInstructionRepository)
			.to(ProposalInstructionRepository)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.VaultRepository)
			.to(VaultRepository)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.DecodedInstructionRepository)
			.to(DecodedInstructionRepository)
			.inSingletonScope();
	},
);

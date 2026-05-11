import { DOMAIN_TYPES } from "@sentinel/domain";
import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { DecodedInstructionRepository } from "../repositories/DecodedInstructionRepository.js";
import { MultisigRepository } from "../repositories/MultisigRepository.js";
import { MultisigScoreRepository } from "../repositories/MultisigScoreRepository.js";
import { MultisigThreatExposureRepository } from "../repositories/MultisigThreatExposureRepository.js";
import { NonceAccountRepository } from "../repositories/NonceAccountRepository.js";
import { OutboxEventRepository } from "../repositories/OutboxEventRepository.js";
import { ProgramRepository } from "../repositories/ProgramRepository.js";
import { ProposalInstructionRepository } from "../repositories/ProposalInstructionRepository.js";
import { ProposalRepository } from "../repositories/ProposalRepository.js";
import { ProposalScoreRepository } from "../repositories/ProposalScoreRepository.js";
import { SignerRepository } from "../repositories/SignerRepository.js";
import { ThreatSignalRepository } from "../repositories/ThreatSignalRepository.js";
import { VaultRepository } from "../repositories/VaultRepository.js";
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

		options
			.bind(DOMAIN_TYPES.MultisigScoreRepository)
			.to(MultisigScoreRepository)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.ProposalScoreRepository)
			.to(ProposalScoreRepository)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.ProgramRepository)
			.to(ProgramRepository)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.ThreatSignalRepository)
			.to(ThreatSignalRepository)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.NonceAccountRepository)
			.to(NonceAccountRepository)
			.inSingletonScope();

		options
			.bind(DOMAIN_TYPES.MultisigThreatExposureRepository)
			.to(MultisigThreatExposureRepository)
			.inSingletonScope();
	},
);

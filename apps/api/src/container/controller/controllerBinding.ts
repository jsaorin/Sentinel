import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { HealthController } from "../../presentation/health/HealthController.js";
import { MultisigController } from "../../presentation/multisigs/MultisigController.js";
import { ProposalController } from "../../presentation/proposals/ProposalController.js";
import { CONTROLLER_TYPES } from "./controllerTypes.js";

export const controllerBindings = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		options
			.bind<HealthController>(CONTROLLER_TYPES.HealthController)
			.to(HealthController);

		options
			.bind<MultisigController>(CONTROLLER_TYPES.MultisigController)
			.to(MultisigController);

		options
			.bind<ProposalController>(CONTROLLER_TYPES.ProposalController)
			.to(ProposalController);
	},
);

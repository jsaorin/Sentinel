import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { HealthController } from "../../presentation/health/HealthController.js";
import { CONTROLLER_TYPES } from "./controllerTypes.js";

export const controllerBindings = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		options
			.bind<HealthController>(CONTROLLER_TYPES.HealthController)
			.to(HealthController);
	},
);

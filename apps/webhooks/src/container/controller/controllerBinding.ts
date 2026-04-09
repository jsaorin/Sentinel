import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { HeliusWebhookController } from "../../presentation/controllers/HeliusWebhookController.js";
import { HealthController } from "../../presentation/health/HealthController.js";
import { CONTROLLER_TYPES } from "./controllerTypes.js";

export const controllerBindings = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		options
			.bind(CONTROLLER_TYPES.HeliusWebhookController)
			.to(HeliusWebhookController);

		options.bind(CONTROLLER_TYPES.HealthController).to(HealthController);
	},
);

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { APPLICATION_TYPES } from "../types.js";
import { HealthCheckQueryHandler } from "../usecases/health/queries/HealthCheckQueryHandler.js";

export const applicationModule = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		const { bind } = options;

		bind(APPLICATION_TYPES.HealthCheckQueryHandler)
			.to(HealthCheckQueryHandler)
			.inSingletonScope();
	},
);

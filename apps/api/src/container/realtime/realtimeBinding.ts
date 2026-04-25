import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { RealtimeGateway } from "../../realtime/RealtimeGateway.js";
import { REALTIME_TYPES } from "./realtimeTypes.js";

export const realtimeBindings = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		options
			.bind<RealtimeGateway>(REALTIME_TYPES.RealtimeGateway)
			.to(RealtimeGateway)
			.inSingletonScope();
	},
);

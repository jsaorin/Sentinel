import "reflect-metadata";
import { applicationModule } from "@sentinel/application";
import {
	portsModule,
	repositoryModule,
	serviceModule,
} from "@sentinel/infrastructure";
import { Container } from "inversify";
import { configBindings } from "./container/config/configBinding.js";
import { controllerBindings } from "./container/controller/controllerBinding.js";
import { realtimeBindings } from "./container/realtime/realtimeBinding.js";

const container = new Container();

export { container };

container.load(
	configBindings,
	repositoryModule,
	serviceModule,
	portsModule,
	applicationModule,
	controllerBindings,
	realtimeBindings,
);

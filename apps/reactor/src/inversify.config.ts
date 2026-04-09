import "reflect-metadata";
import { applicationModule } from "@sentinel/application";
import {
	portsModule,
	repositoryModule,
	serviceModule,
} from "@sentinel/infrastructure";
import { Container } from "inversify";
import { configModule } from "./container/config/configBinding.js";

const container = new Container();

export { container };

container.load(
	configModule,
	repositoryModule,
	serviceModule,
	portsModule,
	applicationModule,
);

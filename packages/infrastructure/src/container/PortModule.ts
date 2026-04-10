import { APPLICATION_TYPES } from "@sentinel/application";
import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { OutboxAwareEventPublisher } from "../events/OutboxAwareEventPublisher.js";
import { RabbitMqEventPublisher } from "../events/RabbitMqEventPublisher.js";
import { RedisInboxStore } from "../events/RedisInboxStore.js";

export const portsModule = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		options
			.bind(APPLICATION_TYPES.EventPublisher)
			.to(RabbitMqEventPublisher)
			.inSingletonScope();

		options
			.bind(APPLICATION_TYPES.OutboxEventPublisher)
			.to(OutboxAwareEventPublisher)
			.inSingletonScope();

		options
			.bind(APPLICATION_TYPES.InboxStore)
			.to(RedisInboxStore)
			.inSingletonScope();
	},
);

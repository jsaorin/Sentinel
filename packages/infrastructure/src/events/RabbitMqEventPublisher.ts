import {
	APPLICATION_TYPES,
	type EventPublishOptions,
	type EventPublisherConfig,
	type IEventPublisher,
	type IntegrationEvent,
} from "@sentinel/application";
import amqplib, { type ConfirmChannel, type Options } from "amqplib";
import { inject, injectable } from "inversify";

import type { ILogger } from "@sentinel/common/logger";
import { INFRASTRUCTURE_TYPES } from "../types.js";

@injectable()
export class RabbitMqEventPublisher implements IEventPublisher {
	private connection!: amqplib.ChannelModel;
	private ch!: ConfirmChannel;
	private initialized = false;
	private isReconnecting = false;

	constructor(
		@inject(APPLICATION_TYPES.EventPublisherConfig)
		private cfg: EventPublisherConfig,
		@inject(INFRASTRUCTURE_TYPES.Logger) private logger: ILogger,
	) {}

	private get exchangeName() {
		return this.cfg.exchangeName ?? "reactor.events";
	}
	private get exchangeType() {
		return this.cfg.exchangeType ?? "topic";
	}
	private get confirmTimeoutMs() {
		return this.cfg.confirmTimeoutMs ?? 5000;
	}

	async connect(): Promise<void> {
		if (this.initialized && !this.isReconnecting) return;

		try {
			this.connection = await amqplib.connect(this.cfg.url);
			this.ch = await this.connection.createConfirmChannel();

			this.setupConnectionHandlers();

			await this.ch.assertExchange(this.exchangeName, this.exchangeType, {
				durable: true,
			});

			this.initialized = true;
			this.isReconnecting = false;
			this.logger.info("RabbitMqEventPublisher connected", {
				exchange: this.exchangeName,
				type: this.exchangeType,
			});
		} catch (error) {
			this.initialized = false;
			this.isReconnecting = false;
			this.logger.error("Failed to connect to RabbitMQ", { error });
			throw error;
		}
	}

	private setupConnectionHandlers(): void {
		this.connection.on("close", (err) => {
			this.logger.warning("RabbitMQ connection closed", { error: err });
			this.initialized = false;
			this.scheduleReconnect();
		});

		this.connection.on("error", (err) => {
			this.logger.error("RabbitMQ connection error", { error: err });
			this.initialized = false;
		});

		this.ch.on("close", () => {
			this.logger.warning("RabbitMQ channel closed");
			this.initialized = false;
			this.scheduleReconnect();
		});

		this.ch.on("error", (err) => {
			this.logger.error("RabbitMQ channel error", { error: err });
			this.initialized = false;
		});
	}

	private scheduleReconnect(delayMs = 5000): void {
		if (this.isReconnecting) return;

		this.isReconnecting = true;
		this.logger.info("Scheduling RabbitMQ reconnection", { delayMs });

		setTimeout(async () => {
			try {
				this.logger.info("Attempting to reconnect to RabbitMQ");
				await this.connect();
			} catch (error) {
				this.logger.error("Reconnection failed, will retry", { error });
				this.isReconnecting = false;
				this.scheduleReconnect(Math.min(delayMs * 2, 60000));
			}
		}, delayMs);
	}

	async publish<T>(
		event: IntegrationEvent<T>,
		opts?: EventPublishOptions,
	): Promise<void> {
		await this.ensureConnection();

		const enrichedEvent = {
			...event,
			metadata: {
				...event.metadata,
				publishedAt: new Date().toISOString(),
			},
		};

		const routingKey = (opts?.routingKey ?? event.type) || "";
		const payload = Buffer.from(JSON.stringify(enrichedEvent));

		const props: Options.Publish = {
			contentType: "application/json",
			persistent: true,
			messageId: event.id,
			timestamp: Date.now(),
			appId: this.cfg.appId,
			headers: { ...(opts?.headers ?? {}) },
		};

		await this.publishWithConfirm(
			this.exchangeName,
			routingKey,
			payload,
			props,
		);

		this.logger.debug("Published integration event", {
			routingKey,
			id: event.id,
			type: event.type,
		});
	}

	private async ensureConnection(): Promise<void> {
		if (!this.initialized) {
			await this.connect();
		}
	}

	async close(): Promise<void> {
		if (!this.initialized) return;
		try {
			await this.ch.close();
			await this.connection.close();
		} catch (error) {
			this.logger.warning("Error closing RabbitMQ connection", { error });
		} finally {
			this.initialized = false;
			this.logger.info("RabbitMqEventPublisher closed");
		}
	}

	private publishWithConfirm(
		exchange: string,
		key: string,
		body: Buffer,
		props: Options.Publish,
	): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const timer = setTimeout(
				() => reject(new Error("AMQP publish confirm timeout")),
				this.confirmTimeoutMs,
			);
			this.ch.publish(exchange, key, body, props, (err) => {
				clearTimeout(timer);
				err ? reject(err) : resolve();
			});
		});
	}
}

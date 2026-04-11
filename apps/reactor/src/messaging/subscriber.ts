import type { ILogger } from "@sentinel/common/logger";
import amqplib, { type Channel, type ConsumeMessage } from "amqplib";
import type { Container } from "inversify";
import pLimit from "p-limit";
import { computeDelayMs } from "./retry.js";
import { assertTopology, getRetryExchange } from "./topology.js";
import type {
	HandlerContext,
	IntegrationEvent,
	Subscription,
} from "./types.js";

type SubscriberConfig = {
	url: string;
	exchangeDefault: string;
	prefetch: number;
	manualAck: boolean;
};

export class Subscriber {
	private conn!: amqplib.ChannelModel;
	private ch!: Channel;
	private consumers: string[] = [];
	private limits: Array<{ queue: string; limit: ReturnType<typeof pLimit> }> =
		[];
	private bound = false;
	private initialized = false;
	private isReconnecting = false;
	private subscriptions: Subscription[] = [];
	private reconnectTimer: NodeJS.Timeout | null = null;
	private isShuttingDown = false;

	constructor(
		private cfg: SubscriberConfig,
		private logger: ILogger,
		private container: Container,
	) {}

	async connect(): Promise<void> {
		if (this.initialized && !this.isReconnecting) return;

		try {
			this.conn = await amqplib.connect(this.cfg.url);
			this.ch = await this.conn.createChannel();

			this.setupConnectionHandlers();

			this.initialized = true;
			this.isReconnecting = false;
			this.logger.info("Subscriber connected to RabbitMQ");
		} catch (error) {
			this.initialized = false;
			this.isReconnecting = false;
			this.logger.error("Failed to connect to RabbitMQ", { error });
			throw error;
		}
	}

	private setupConnectionHandlers(): void {
		this.conn.on("close", (err) => {
			this.logger.warning("RabbitMQ connection closed", { error: err });
			this.initialized = false;
			this.bound = false;
			this.scheduleReconnect();
		});

		this.conn.on("error", (err) => {
			this.logger.error("RabbitMQ connection error", { error: err });
			this.initialized = false;
			this.bound = false;
		});

		this.ch.on("close", () => {
			this.logger.warning("RabbitMQ channel closed");
			this.initialized = false;
			this.bound = false;
			this.scheduleReconnect();
		});

		this.ch.on("error", (err) => {
			this.logger.error("RabbitMQ channel error", { error: err });
			this.initialized = false;
			this.bound = false;
		});
	}

	private scheduleReconnect(delayMs = 5000): void {
		if (this.isReconnecting || this.isShuttingDown) return;

		this.isReconnecting = true;
		this.logger.info("Scheduling RabbitMQ reconnection", { delayMs });

		this.reconnectTimer = setTimeout(async () => {
			if (this.isShuttingDown) {
				this.isReconnecting = false;
				return;
			}

			try {
				this.logger.info("Attempting to reconnect to RabbitMQ");
				this.consumers = [];
				this.limits = [];

				await this.connect();

				if (this.subscriptions.length > 0) {
					await this.bind(this.subscriptions);
					this.logger.info(
						"Successfully re-bound subscriptions after reconnect",
						{
							subscriptionCount: this.subscriptions.length,
						},
					);
				}
			} catch (error) {
				this.logger.error("Reconnection failed, will retry", { error });
				this.isReconnecting = false;
				this.scheduleReconnect(Math.min(delayMs * 2, 60000));
			}
		}, delayMs);
	}

	async bind(subs: Subscription[]): Promise<void> {
		this.subscriptions = subs;

		await assertTopology(this.ch, subs, this.cfg.exchangeDefault);
		this.ch.prefetch(this.cfg.prefetch);

		for (const sub of subs) {
			const limit = pLimit(sub.concurrency ?? 10);
			this.limits.push({ queue: sub.queue, limit });

			const { consumerTag } = await this.ch.consume(
				sub.queue,
				(msg) => msg && this.dispatch(sub, msg, limit),
				{ noAck: !this.cfg.manualAck },
			);

			this.consumers.push(consumerTag);
			this.logger.info("consumer:bound", {
				queue: sub.queue,
				keys: sub.keys,
				prefetch: sub.prefetch ?? this.cfg.prefetch,
			});
		}

		this.bound = true;
	}

	private async dispatch(
		sub: Subscription,
		msg: ConsumeMessage,
		limit: ReturnType<typeof pLimit>,
	) {
		limit(async () => {
			const { ch, logger, container } = this;
			try {
				const event = JSON.parse(msg.content.toString()) as IntegrationEvent;

				const ctx: HandlerContext = {
					event,
					raw: msg,
					ch,
					logger,
					container,
					queue: sub.queue,
				};

				if (sub.validate) sub.validate(event);
				await sub.handler(ctx);

				if (this.cfg.manualAck) {
					ch.ack(msg);
				}
			} catch (e) {
				logger.error("consumer:dispatch-error", {
					err: (e as Error).message,
				});

				const headers = msg.properties.headers ?? {};
				const attempt = Number(headers["x-attempt"] ?? 0);
				const nextAttempt = attempt + 1;

				if (sub.retry && nextAttempt <= sub.retry.attempts) {
					const delay = computeDelayMs(nextAttempt, sub.retry);
					const originalRoutingKey = msg.fields.routingKey;
					const mainExchange = sub.exchange || this.cfg.exchangeDefault;
					const retryExchange = getRetryExchange(mainExchange);

					this.ch.publish(retryExchange, originalRoutingKey, msg.content, {
						expiration: String(delay),
						contentType: msg.properties.contentType,
						persistent: true,
						messageId: msg.properties.messageId,
						headers: {
							...headers,
							"x-attempt": nextAttempt,
						},
					});

					if (this.cfg.manualAck) {
						this.ch.ack(msg);
					}

					logger.warning("event:retry-scheduled", {
						id: msg.properties.messageId,
						nextAttempt,
						delayMs: delay,
					});
				} else {
					if (this.cfg.manualAck) {
						this.ch.nack(msg, false, false);
					}

					logger.error("event:to-dlq-or-dropped", {
						id: msg.properties.messageId,
						attempts: attempt,
					});
				}
			}
		});
	}

	async stop(opts: { drainMs?: number } = {}): Promise<void> {
		this.isShuttingDown = true;

		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
			this.logger.info("Cancelled pending reconnection timer");
		}

		if (!this.bound) return;
		const drainMs = opts.drainMs ?? 10_000;

		for (const tag of this.consumers) {
			try {
				await this.ch.cancel(tag);
			} catch {
				// Best-effort cancel
			}
		}

		const start = Date.now();
		const stillBusy = () => this.limits.some((l) => l.limit.activeCount > 0);
		while (stillBusy() && Date.now() - start < drainMs) {
			await new Promise((r) => setTimeout(r, 100));
		}

		try {
			await this.ch.close();
		} catch {
			// Best-effort close
		}
		try {
			await this.conn.close();
		} catch {
			// Best-effort close
		}

		this.bound = false;
		this.logger.info("subscriber:stopped", { drained: !stillBusy() });
	}
}

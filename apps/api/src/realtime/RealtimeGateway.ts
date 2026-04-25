import type { Server as HttpServer } from "node:http";
import { APPLICATION_TYPES } from "@sentinel/application";
import type { ILogger } from "@sentinel/common/logger";
import {
	REALTIME_REDIS_CHANNEL,
	type RealtimeAction,
	type RealtimeClientToServerEvents,
	type RealtimeServerToClientEvents,
	realtimeEnvelopeSchema,
} from "@sentinel/common/realtime";
import { DOMAIN_TYPES } from "@sentinel/domain";
import { createAdapter } from "@socket.io/redis-adapter";
import { inject, injectable } from "inversify";
import { Redis } from "ioredis";
import { Server } from "socket.io";

type RedisOptions = { host: string; port: number };

@injectable()
export class RealtimeGateway {
	private io?: Server<
		RealtimeClientToServerEvents,
		RealtimeServerToClientEvents
	>;
	private pubClient?: Redis;
	private subClient?: Redis;
	private bridgeClient?: Redis;

	constructor(
		@inject(DOMAIN_TYPES.RedisConfig) private redisConfig: RedisOptions,
		@inject(APPLICATION_TYPES.Logger) private logger: ILogger,
	) {}

	async attach(server: HttpServer): Promise<void> {
		this.pubClient = new Redis({
			host: this.redisConfig.host,
			port: this.redisConfig.port,
		});
		this.subClient = this.pubClient.duplicate();
		this.bridgeClient = this.pubClient.duplicate();

		for (const [name, client] of [
			["pub", this.pubClient],
			["sub", this.subClient],
			["bridge", this.bridgeClient],
		] as const) {
			client.on("error", (err) => {
				this.logger.warning("Realtime gateway Redis error", {
					client: name,
					error: err.message,
				});
			});
		}

		this.io = new Server(server, {
			path: "/ws",
			cors: { origin: "*" },
			transports: ["websocket"],
		});

		this.io.adapter(createAdapter(this.pubClient, this.subClient));

		this.io.on("connection", (socket) => {
			this.logger.info("Realtime client connected", { socketId: socket.id });

			socket.on("subscribe", (room, ack) => {
				if (!room || typeof room !== "string") {
					ack?.(false);
					return;
				}
				socket.join(room);
				this.logger.debug("Realtime subscribe", {
					socketId: socket.id,
					room,
				});
				ack?.(true);
			});

			socket.on("unsubscribe", (room) => {
				if (!room || typeof room !== "string") return;
				socket.leave(room);
				this.logger.debug("Realtime unsubscribe", {
					socketId: socket.id,
					room,
				});
			});

			socket.on("disconnect", (reason) => {
				this.logger.info("Realtime client disconnected", {
					socketId: socket.id,
					reason,
				});
			});
		});

		await this.bridgeClient.subscribe(REALTIME_REDIS_CHANNEL);
		this.bridgeClient.on("message", (channel, raw) => {
			if (channel !== REALTIME_REDIS_CHANNEL) return;
			this.fanOut(raw);
		});

		this.logger.info("Realtime gateway attached", { path: "/ws" });
	}

	private fanOut(raw: string): void {
		if (!this.io) return;

		let parsed: unknown;
		try {
			parsed = JSON.parse(raw);
		} catch (err) {
			this.logger.warning("Realtime envelope JSON invalid", {
				error: err instanceof Error ? err.message : String(err),
			});
			return;
		}

		const result = realtimeEnvelopeSchema.safeParse(parsed);
		if (!result.success) {
			this.logger.warning("Realtime envelope schema invalid", {
				error: result.error.message,
			});
			return;
		}

		const envelope = result.data;
		const target =
			envelope.type === "room" ? this.io.to(envelope.room) : this.io;
		(target.emit as (event: string, data: unknown) => boolean)(
			envelope.action,
			envelope.data,
		);
	}

	async close(): Promise<void> {
		if (this.io) {
			await new Promise<void>((resolve) => this.io?.close(() => resolve()));
		}
		await Promise.all([
			this.bridgeClient?.quit().catch(() => undefined),
			this.subClient?.quit().catch(() => undefined),
			this.pubClient?.quit().catch(() => undefined),
		]);
		this.logger.info("Realtime gateway closed");
	}
}

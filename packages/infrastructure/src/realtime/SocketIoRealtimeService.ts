import { APPLICATION_TYPES } from "@sentinel/application";
import type { ILogger } from "@sentinel/common/logger";
import {
	REALTIME_REDIS_CHANNEL,
	type RealtimeAction,
	type RealtimePayloadMap,
} from "@sentinel/common/realtime";
import { DOMAIN_TYPES, type IRealtimeService } from "@sentinel/domain";
import { inject, injectable } from "inversify";
import { Redis } from "ioredis";

type RedisOptions = { host: string; port: number };

@injectable()
export class SocketIoRealtimeService implements IRealtimeService {
	private readonly publisher: Redis;

	constructor(
		@inject(DOMAIN_TYPES.RedisConfig) options: RedisOptions,
		@inject(APPLICATION_TYPES.Logger) private logger: ILogger,
	) {
		this.publisher = new Redis({
			host: options.host,
			port: options.port,
			lazyConnect: false,
		});

		this.publisher.on("error", (err) => {
			this.logger.warning("Realtime publisher Redis error", {
				error: err.message,
			});
		});
	}

	async emitToRoom<A extends RealtimeAction>(
		room: string,
		action: A,
		data: RealtimePayloadMap[A],
	): Promise<void> {
		const envelope = {
			type: "room" as const,
			room,
			action,
			data,
			timestamp: new Date().toISOString(),
		};
		await this.publish(envelope);
	}

	async broadcast<A extends RealtimeAction>(
		action: A,
		data: RealtimePayloadMap[A],
	): Promise<void> {
		const envelope = {
			type: "broadcast" as const,
			action,
			data,
			timestamp: new Date().toISOString(),
		};
		await this.publish(envelope);
	}

	private async publish(envelope: unknown): Promise<void> {
		try {
			await this.publisher.publish(
				REALTIME_REDIS_CHANNEL,
				JSON.stringify(envelope),
			);
		} catch (err) {
			this.logger.warning("Realtime publish failed", {
				error: err instanceof Error ? err.message : String(err),
			});
		}
	}
}

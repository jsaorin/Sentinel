import type { InboxStore } from "@sentinel/application";
import { DOMAIN_TYPES } from "@sentinel/domain";
import { inject, injectable } from "inversify";
import { Redis } from "ioredis";

type RedisOptions = { host: string; port: number };

@injectable()
export class RedisInboxStore implements InboxStore {
	private redis: Redis;
	private keyPrefix: string;
	private lockPrefix: string;

	private lockTokens = new Map<string, string>();

	constructor(@inject(DOMAIN_TYPES.RedisConfig) options: RedisOptions) {
		this.redis = new Redis({ host: options.host, port: options.port });
		this.keyPrefix = "inbox:";
		this.lockPrefix = `${this.keyPrefix}lock:`;
	}

	async isProcessed(messageId: string): Promise<boolean> {
		const key = `${this.keyPrefix}${messageId}`;
		return (await this.redis.exists(key)) === 1;
	}

	async markProcessed(
		messageId: string,
		ttlSeconds = 24 * 60 * 60,
	): Promise<void> {
		const key = `${this.keyPrefix}${messageId}`;
		await this.redis.set(key, "1", "EX", ttlSeconds);
	}

	async tryAcquireLock(
		messageId: string,
		lockTtlSeconds = 60,
	): Promise<boolean> {
		const lockKey = `${this.lockPrefix}${messageId}`;
		const token = crypto.randomUUID();
		const res = await this.redis.set(
			lockKey,
			token,
			"EX",
			lockTtlSeconds,
			"NX",
		);
		const acquired = res === "OK";
		if (acquired) this.lockTokens.set(messageId, token);
		return acquired;
	}

	async releaseLock(messageId: string): Promise<void> {
		const lockKey = `${this.lockPrefix}${messageId}`;
		const token = this.lockTokens.get(messageId);
		if (!token) return;

		const lua = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
		try {
			await this.redis.eval(lua, 1, lockKey, token);
		} finally {
			this.lockTokens.delete(messageId);
		}
	}

	async close(): Promise<void> {
		await this.redis.quit();
	}

	async ping(): Promise<string> {
		return this.redis.ping();
	}
}

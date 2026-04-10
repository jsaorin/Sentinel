import type { ILogger } from "@sentinel/common/logger";
import type { Channel, ConsumeMessage } from "amqplib";
import type { Container } from "inversify";

export type IntegrationEvent<T = unknown> = {
	id: string;
	type: string;
	time: string;
	data: T;
	metadata?: Record<string, unknown>;
};

export type HandlerContext<T = unknown> = {
	event: IntegrationEvent<T>;
	raw: ConsumeMessage;
	ch: Channel;
	logger: ILogger;
	container: Container;
	queue: string;
};

export type Handler<T = unknown> = (ctx: HandlerContext<T>) => Promise<void>;
export type Middleware<T = unknown> = (next: Handler<T>) => Handler<T>;

export type RetryConfig = {
	attempts: number;
	backoff:
		| { kind: "fixed"; baseMs: number }
		| { kind: "exponential"; baseMs: number; factor?: number; maxMs?: number };
	jitter?: { type: "full" } | { type: "percent"; percent: number };
};

export type Subscription<T = unknown> = {
	exchange: string;
	queue: string;
	keys: string[];

	prefetch?: number;
	concurrency?: number;

	retry?: RetryConfig;
	dlq?: { exchange: string; queue: string };

	validate?: (e: IntegrationEvent) => void;
	handler: Handler<T>;
};

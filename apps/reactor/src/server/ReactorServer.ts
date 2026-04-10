import type { Server } from "node:http";
import type { InboxStore } from "@sentinel/application";
import type { ILogger } from "@sentinel/common/logger";
import express, { type Express, type Request, type Response } from "express";
import type { Subscriber } from "../messaging/subscriber.js";

export class ReactorServer {
	private app: Express;
	private server: Server | null = null;

	constructor(
		private logger: ILogger,
		private subscriber: Subscriber | null,
		private redis: InboxStore | null,
		private port: number,
	) {
		this.app = express();
		this.setupRoutes();
	}

	private setupRoutes(): void {
		this.app.get("/api/v1/health", async (_req: Request, res: Response) => {
			const checks = await this.runHealthChecks();

			const isHealthy = checks.every((check) => check.ok);
			const statusCode = isHealthy ? 200 : 503;

			res.status(statusCode).json({
				status: isHealthy ? "ok" : "unhealthy",
				timestamp: new Date().toISOString(),
				checks: checks.reduce(
					(acc, check) => {
						acc[check.name] = check.ok ? "ok" : "failed";
						if (!check.ok && check.error) {
							acc[`${check.name}_error`] = check.error;
						}
						return acc;
					},
					{} as Record<string, string>,
				),
			});
		});

		this.app.use((_req: Request, res: Response) => {
			res.status(404).json({
				status: "error",
				message: "Not found",
			});
		});
	}

	private async runHealthChecks(): Promise<
		Array<{ name: string; ok: boolean; error?: string }>
	> {
		const checks: Array<{ name: string; ok: boolean; error?: string }> = [];

		try {
			if (!this.subscriber) {
				checks.push({
					name: "rabbitmq_subscriber",
					ok: false,
					error: "Subscriber not initialized",
				});
			} else if (!(this.subscriber as unknown as { bound: boolean }).bound) {
				checks.push({
					name: "rabbitmq_subscriber",
					ok: false,
					error: "Consumer not bound to queues",
				});
			} else {
				checks.push({ name: "rabbitmq_subscriber", ok: true });
			}
		} catch (error) {
			checks.push({
				name: "rabbitmq_subscriber",
				ok: false,
				error: (error as Error).message,
			});
		}

		try {
			if (!this.redis) {
				checks.push({
					name: "redis",
					ok: false,
					error: "Redis not initialized",
				});
			} else {
				await this.redis.ping();
				checks.push({ name: "redis", ok: true });
			}
		} catch (error) {
			checks.push({
				name: "redis",
				ok: false,
				error: (error as Error).message,
			});
		}

		return checks;
	}

	async start(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.server = this.app.listen(this.port, () => {
					this.logger.info("health-server:started", { port: this.port });
					resolve();
				});

				this.server.on("error", (error) => {
					this.logger.error("health-server:error", { error });
					reject(error);
				});
			} catch (error) {
				this.logger.error("health-server:start-failed", { error });
				reject(error);
			}
		});
	}

	async stop(): Promise<void> {
		if (!this.server) return;

		return new Promise((resolve, reject) => {
			this.server?.close((error) => {
				if (error) {
					this.logger.error("health-server:stop-error", { error });
					reject(error);
				} else {
					this.logger.info("health-server:stopped");
					resolve();
				}
			});
		});
	}
}

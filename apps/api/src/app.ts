import "reflect-metadata";
import type { Server } from "node:http";
import { getPrismaClient } from "@sentinel/infrastructure";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import environment from "./env/api-environment.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import routes from "./presentation/routes.js";
import { logger } from "./logger/logger.js";

class App {
	public express: express.Application;
	private server?: Server;

	constructor() {
		this.express = express();
		this.express.set("trust proxy", 1);
		this.setMiddlewares();
		this.disableSettings();
		this.setRoutes();
		this.setErrorHandler();
	}

	private setMiddlewares(): void {
		this.express.use(express.json());
		this.express.use(cors());
		this.express.use(express.urlencoded({ extended: true }));
		this.express.use(helmet());
	}

	private disableSettings(): void {
		this.express.disable("x-powered-by");
	}

	private setRoutes(): void {
		const version = environment.apiVersion;
		this.express.use(`/${environment.basePath}/${version}`, routes);
	}

	private setErrorHandler(): void {
		this.express.use(errorHandler());
	}

	public async connectPrisma(): Promise<void> {
		const prismaClient = getPrismaClient();
		await prismaClient.$connect();
	}

	public async start(): Promise<void> {
		await this.connectPrisma();

		this.server = this.express.listen(environment.port, () => {
			const port = environment.port;
			const env = environment.getCurrentEnvironment();
			const basePath = environment.basePath;
			const version = environment.apiVersion;

			logger.info(`Sentinel API started`, {
				port,
				env,
				url: `http://localhost:${port}/${basePath}/${version}`,
			});
		});
	}

	public async shutdown(): Promise<void> {
		if (this.server) {
			this.server.close(() => logger.info("HTTP server closed"));
		}

		try {
			await getPrismaClient().$disconnect();
			logger.info("Prisma disconnected");
			process.exit(0);
		} catch (err) {
			logger.error("Error during shutdown", { err });
			process.exit(1);
		}
	}
}

export default App;

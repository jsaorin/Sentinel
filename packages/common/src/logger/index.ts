import type { ILogger, LoggerConfiguration } from "./definition.js";
import PinoLogger from "./pino.logger.js";

export { ILogger } from "./definition.js";

export class LoggerWrapper implements ILogger {
	#underlyingLogger: ILogger | null = null;
	private readonly app: string;
	private readonly prettyPrint: boolean;

	constructor(app: string, prettyPrint = false) {
		this.app = app;
		this.prettyPrint = prettyPrint;
	}

	#getInitializeLogger(): ILogger {
		this.configureLogger({ prettyPrint: this.prettyPrint }, false);
		return this.#underlyingLogger!;
	}

	configureLogger(
		configuration: Partial<LoggerConfiguration>,
		overrideIfExists = true,
	): void {
		if (this.#underlyingLogger === null || overrideIfExists === true) {
			this.#underlyingLogger = new PinoLogger(
				configuration.level || "info",
				configuration.prettyPrint || false,
			);
		}
	}

	resetLogger() {
		this.#underlyingLogger = null;
	}

	#enrichMetadata(metadata?: object): object {
		return {
			app: this.app,
			...(metadata || {}),
		};
	}

	debug(message: string, metadata?: object): void {
		this.#getInitializeLogger().debug(message, this.#enrichMetadata(metadata));
	}

	error(message: string, metadata?: object): void {
		this.#getInitializeLogger().error(message, this.#enrichMetadata(metadata));
	}

	info(message: string, metadata?: object): void {
		this.#getInitializeLogger().info(message, this.#enrichMetadata(metadata));
	}

	warning(message: string, metadata?: object): void {
		this.#getInitializeLogger().warning(
			message,
			this.#enrichMetadata(metadata),
		);
	}
}

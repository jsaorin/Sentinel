import {
	type DestinationStream,
	type Logger as PinoLoggerImpl,
	pino,
} from "pino";
import type { ILogger, LOG_LEVELS } from "./definition.js";

export default class PinoLogger implements ILogger {
	readonly #logger: PinoLoggerImpl;

	constructor(
		private level: LOG_LEVELS,
		private prettyPrintEnabled: boolean,
		private destStream?: DestinationStream | string,
	) {
		this.#logger = pino({
			level: this.level,
			transport: this.prettyPrintEnabled
				? {
						target: "pino-pretty",
						options: {
							colorize: true,
							sync: true,
						},
					}
				: undefined,
		});
	}

	debug(message: string, metadata?: object): void {
		if (metadata) {
			this.#logger.debug(metadata, message);
		} else {
			this.#logger.debug(message);
		}
	}

	error(message: string, metadata?: object): void {
		if (metadata) {
			this.#logger.error(metadata, message);
		} else {
			this.#logger.error(message);
		}
	}

	info(message: string, metadata?: object): void {
		if (metadata) {
			this.#logger.info(metadata, message);
		} else {
			this.#logger.info(message);
		}
	}

	warning(message: string, metadata?: object): void {
		if (metadata) {
			this.#logger.warn(metadata, message);
		} else {
			this.#logger.warn(message);
		}
	}
}

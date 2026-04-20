import { Environment } from "@sentinel/common";
import type { TelegramChannelConfig } from "@sentinel/infrastructure";
import { cleanEnv } from "envalid";
import { z } from "zod";
import envValidationConfig from "./env-validation.config.js";

const channelsSchema = z.array(
	z.object({
		id: z.string().min(1),
		label: z.string().optional(),
	}),
);

class WatcherEnvironment extends Environment {
	private _amqpUrl!: string;
	private _telegramBotToken!: string;
	private _telegramChannels!: TelegramChannelConfig[];

	constructor() {
		super();
		this.validateEnvValues();
	}

	protected validateEnvValues() {
		const env = cleanEnv(process.env, envValidationConfig);

		this.amqpUrl = `${env.RABBITMQ_PROTOCOL}://${env.RABBITMQ_USER}:${env.RABBITMQ_PASSWORD}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}`;
		this.telegramBotToken = env.TELEGRAM_BOT_TOKEN;

		let parsedChannels: unknown;
		try {
			parsedChannels = JSON.parse(env.TELEGRAM_CHANNELS);
		} catch (err) {
			throw new Error(
				`TELEGRAM_CHANNELS is not valid JSON: ${(err as Error).message}`,
			);
		}

		const result = channelsSchema.safeParse(parsedChannels);
		if (!result.success) {
			throw new Error(
				`TELEGRAM_CHANNELS schema invalid: ${result.error.message}`,
			);
		}

		this.telegramChannels = result.data;
	}

	get amqpUrl() {
		return this._amqpUrl;
	}
	set amqpUrl(value) {
		this._amqpUrl = value;
	}

	get telegramBotToken() {
		return this._telegramBotToken;
	}
	set telegramBotToken(value) {
		this._telegramBotToken = value;
	}

	get telegramChannels() {
		return this._telegramChannels;
	}
	set telegramChannels(value) {
		this._telegramChannels = value;
	}
}

export default new WatcherEnvironment();

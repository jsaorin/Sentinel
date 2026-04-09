import { Environment } from "@sentinel/common";
import { cleanEnv } from "envalid";
import envValidationConfig from "./env-validation.config.js";

class ReactorEnvironment extends Environment {
	private _amqpUrl!: string;
	private _reactorPort!: number;

	constructor() {
		super();
		this.validateEnvValues();
	}

	protected validateEnvValues() {
		const env = cleanEnv(process.env, envValidationConfig);

		this.amqpUrl = `${env.RABBITMQ_PROTOCOL}://${env.RABBITMQ_USER}:${env.RABBITMQ_PASSWORD}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}`;
		this.reactorPort = env.REACTOR_PORT;
	}

	get amqpUrl() {
		return this._amqpUrl;
	}

	set amqpUrl(value) {
		this._amqpUrl = value;
	}

	get reactorPort() {
		return this._reactorPort;
	}

	set reactorPort(value) {
		this._reactorPort = value;
	}
}

export default new ReactorEnvironment();

import { Environment } from "@sentinel/common";
import { cleanEnv } from "envalid";
import envValidationConfig from "./env-validation.config.js";

class ReactorEnvironment extends Environment {
	private _amqpUrl!: string;
	private _reactorPort!: number;
	private _redisHost!: string;
	private _redisPort!: number;
	private _heliusApiKey!: string;

	constructor() {
		super();
		this.validateEnvValues();
	}

	protected validateEnvValues() {
		const env = cleanEnv(process.env, envValidationConfig);

		this.amqpUrl = `${env.RABBITMQ_PROTOCOL}://${env.RABBITMQ_USER}:${env.RABBITMQ_PASSWORD}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}`;
		this.reactorPort = env.REACTOR_PORT;
		this.redisHost = env.REDIS_HOST;
		this.redisPort = env.REDIS_PORT;
		this.heliusApiKey = env.HELIUS_API_KEY;
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

	get redisHost() {
		return this._redisHost;
	}

	set redisHost(value) {
		this._redisHost = value;
	}

	get redisPort() {
		return this._redisPort;
	}

	set redisPort(value) {
		this._redisPort = value;
	}

	get heliusApiKey() {
		return this._heliusApiKey;
	}

	set heliusApiKey(value) {
		this._heliusApiKey = value;
	}
}

export default new ReactorEnvironment();

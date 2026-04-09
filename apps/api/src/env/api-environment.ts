import { Environment } from "@sentinel/common";
import { cleanEnv } from "envalid";
import envValidationConfig from "./env-validation.config.js";

class ApiEnvironment extends Environment {
	private _appName!: string;
	private _apiVersion!: string;
	private _port!: number;
	private _basePath!: string;
	private _solanaRpcUrl!: string;
	private _heliusApiKey!: string;
	private _amqpUrl!: string;

	constructor() {
		super();
		this.validateEnvValues();
	}

	protected validateEnvValues() {
		const env = cleanEnv(process.env, envValidationConfig);

		this.appName = "Api";
		this.apiVersion = env.API_VERSION;
		this.port = env.API_PORT;
		this.basePath = env.BASE_PATH;
		this.solanaRpcUrl = env.SOLANA_RPC_URL;
		this.heliusApiKey = env.HELIUS_API_KEY;
		this.amqpUrl = `${env.RABBITMQ_PROTOCOL}://${env.RABBITMQ_USER}:${env.RABBITMQ_PASSWORD}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}`;
	}

	get appName() {
		return this._appName;
	}

	set appName(value) {
		this._appName = value;
	}

	get port() {
		return this._port;
	}

	set port(value) {
		this._port = value;
	}

	get apiVersion() {
		return this._apiVersion;
	}

	set apiVersion(value) {
		this._apiVersion = value;
	}

	get basePath() {
		return this._basePath;
	}

	set basePath(value) {
		this._basePath = value;
	}

	get solanaRpcUrl() {
		return this._solanaRpcUrl;
	}

	set solanaRpcUrl(value) {
		this._solanaRpcUrl = value;
	}

	get heliusApiKey() {
		return this._heliusApiKey;
	}

	set heliusApiKey(value) {
		this._heliusApiKey = value;
	}

	get amqpUrl() {
		return this._amqpUrl;
	}

	set amqpUrl(value) {
		this._amqpUrl = value;
	}
}

export default new ApiEnvironment();

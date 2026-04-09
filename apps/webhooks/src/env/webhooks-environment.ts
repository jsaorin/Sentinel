import { Environment } from "@sentinel/common";
import { cleanEnv } from "envalid";
import envValidationConfig from "./env-validation.config.js";

class WebhooksEnvironment extends Environment {
	private _appName!: string;
	private _apiVersion!: string;
	private _port!: number;
	private _basePath!: string;
	private _heliusWebhookAuthToken!: string;

	constructor() {
		super();
		this.validateEnvValues();
	}

	protected validateEnvValues() {
		const env = cleanEnv(process.env, envValidationConfig);

		this.appName = "Webhooks";
		this.apiVersion = env.API_VERSION;
		this.port = env.WEBHOOKS_PORT;
		this.basePath = env.BASE_PATH;
		this.heliusWebhookAuthToken = env.HELIUS_WEBHOOK_AUTH_TOKEN;
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

	get heliusWebhookAuthToken() {
		return this._heliusWebhookAuthToken;
	}

	set heliusWebhookAuthToken(value) {
		this._heliusWebhookAuthToken = value;
	}
}

export default new WebhooksEnvironment();

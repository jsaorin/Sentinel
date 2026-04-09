import { Environment } from "@sentinel/common";
import { cleanEnv } from "envalid";
import envValidationConfig from "./env-validation.config.js";

class ApiEnvironment extends Environment {
	private _appName!: string;
	private _apiVersion!: string;
	private _port!: number;
	private _basePath!: string;
	private _solanaRpcUrl!: string;

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
}

export default new ApiEnvironment();

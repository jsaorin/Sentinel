import { Environment } from "@sentinel/common";
import { cleanEnv } from "envalid";
import envValidationConfig from "./env-validation.config.js";

class InfraEnvironment extends Environment {
	private _dataBaseUrl: string;

	constructor() {
		super();
		this.validateEnvValues();
	}

	protected validateEnvValues() {
		const env = cleanEnv(process.env, envValidationConfig);
		this.dataBaseUrl = env.DATABASE_URL;
	}

	get dataBaseUrl() {
		return this._dataBaseUrl;
	}

	set dataBaseUrl(value) {
		this._dataBaseUrl = value;
	}
}

export default new InfraEnvironment();

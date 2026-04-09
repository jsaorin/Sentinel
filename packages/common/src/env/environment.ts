import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as configDotenv } from "dotenv";
import { cleanEnv } from "envalid";
import envValidationConfig from "./env-validation.config.js";
import { EnvironmentFile, Environments } from "./environment.enum.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type CommonEnvKeys = keyof typeof Environments;

export interface IEnvironment {
	getCurrentEnvironment: () => string;
	setEnvironment: (env?: Environments) => void;
	isProd: () => boolean;
	isDev: () => boolean;
	isTest: () => boolean;
	isLocal: () => boolean;
}

class Environment implements IEnvironment {
	private _env!: Environments;

	constructor() {
		this.setEnvironment(
			(process.env.NODE_ENV as Environments) ?? Environments.LOCAL,
		);
	}

	private resolveEnvPath(key: CommonEnvKeys): string {
		const rootDir: string = path.resolve(__dirname, "../../../../");
		const envPath = path.resolve(rootDir, EnvironmentFile[key]);
		const defaultEnvPath = path.resolve(rootDir, EnvironmentFile.DEFAULT);

		if (!fs.existsSync(envPath) && !fs.existsSync(defaultEnvPath)) {
			throw new Error(
				`Environment file not found: ${EnvironmentFile[key]} or ${EnvironmentFile.DEFAULT}`,
			);
		}

		return fs.existsSync(envPath) ? envPath : defaultEnvPath;
	}

	protected validateEnvValues() {
		cleanEnv(process.env, envValidationConfig);
	}

	public setEnvironment(env = Environments.DEV): void {
		this.env = env;

		if (this.env === Environments.LOCAL) {
			const envKey = Object.keys(Environments).find(
				(key) => Environments[key] === this.env,
			) as keyof typeof Environments;
			const envPath = this.resolveEnvPath(envKey);

			configDotenv({ path: envPath });
		}
		this.validateEnvValues();
	}

	public getCurrentEnvironment() {
		return this.env;
	}

	public isProd() {
		return this.env === Environments.PRODUCTION;
	}

	public isDev() {
		return this.env === Environments.DEV;
	}

	public isTest() {
		return this.env === Environments.TEST;
	}

	public isLocal() {
		return this.env === Environments.LOCAL;
	}

	get env() {
		return this._env;
	}

	set env(value) {
		this._env = value;
	}
}

export { Environment };

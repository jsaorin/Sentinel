import { str } from "envalid";
import { Environments } from "./environment.enum.js";

const envValidationConfig = {
	NODE_ENV: str({
		default: Environments.LOCAL,
		choices: [...Object.values(Environments)],
	}),
};

export default envValidationConfig;

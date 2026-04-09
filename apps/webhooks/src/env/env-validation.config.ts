import { num, str } from "envalid";

const envValidationConfig = {
	WEBHOOKS_PORT: num({ default: 3001 }),
	API_VERSION: str({ default: "v1" }),
	BASE_PATH: str({ default: "api" }),
	HELIUS_WEBHOOK_AUTH_TOKEN: str({ default: "" }),
};

export default envValidationConfig;

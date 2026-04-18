import { bool, num, str } from "envalid";

const envValidationConfig = {
	API_PORT: num({ default: 3000 }),
	API_VERSION: str({ default: "v1" }),
	BASE_PATH: str({ default: "api" }),
	SOLANA_RPC_URL: str({ default: "https://api.mainnet-beta.solana.com" }),
	HELIUS_API_KEY: str(),
	GROQ_API_KEY: str({ default: "" }),
	GROQ_MODEL: str({ default: "llama-3.3-70b-versatile" }),
	GROQ_DRY_RUN: bool({ default: false }),
	RABBITMQ_PROTOCOL: str({ default: "amqp" }),
	RABBITMQ_HOST: str({ default: "localhost" }),
	RABBITMQ_PORT: num({ default: 5672 }),
	RABBITMQ_USER: str({ default: "guest" }),
	RABBITMQ_PASSWORD: str({ default: "guest" }),
};

export default envValidationConfig;

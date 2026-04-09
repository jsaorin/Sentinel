import { num, str } from "envalid";

const envValidationConfig = {
	API_PORT: num({ default: 3000 }),
	API_VERSION: str({ default: "v1" }),
	BASE_PATH: str({ default: "api" }),
	SOLANA_RPC_URL: str({ default: "https://api.mainnet-beta.solana.com" }),
	RABBITMQ_PROTOCOL: str({ default: "amqp" }),
	RABBITMQ_HOST: str({ default: "localhost" }),
	RABBITMQ_PORT: num({ default: 5672 }),
	RABBITMQ_USER: str({ default: "guest" }),
	RABBITMQ_PASSWORD: str({ default: "guest" }),
};

export default envValidationConfig;

import { num, str } from "envalid";

const envValidationConfig = {
	WEBHOOKS_PORT: num({ default: 3001 }),
	API_VERSION: str({ default: "v1" }),
	BASE_PATH: str({ default: "api" }),
	HELIUS_WEBHOOK_AUTH_TOKEN: str({ default: "" }),
	RABBITMQ_PROTOCOL: str({ default: "amqp" }),
	RABBITMQ_HOST: str({ default: "localhost" }),
	RABBITMQ_PORT: num({ default: 5672 }),
	RABBITMQ_USER: str({ default: "guest" }),
	RABBITMQ_PASSWORD: str({ default: "guest" }),
};

export default envValidationConfig;

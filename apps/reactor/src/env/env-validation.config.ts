import { bool, num, str } from "envalid";

const envValidationConfig = {
	RABBITMQ_PROTOCOL: str({ default: "amqp" }),
	RABBITMQ_HOST: str({ default: "localhost" }),
	RABBITMQ_PORT: num({ default: 5672 }),
	RABBITMQ_USER: str({ default: "guest" }),
	RABBITMQ_PASSWORD: str({ default: "guest" }),
	REDIS_HOST: str({ default: "localhost" }),
	REDIS_PORT: num({ default: 6379 }),
	REACTOR_PORT: num({ default: 3001 }),
	HELIUS_API_KEY: str(),
	GROQ_API_KEY: str({ default: "" }),
	GROQ_MODEL: str({ default: "llama-3.3-70b-versatile" }),
	GROQ_DRY_RUN: bool({ default: false }),
};

export default envValidationConfig;

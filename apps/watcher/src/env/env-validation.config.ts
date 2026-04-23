import { num, str } from "envalid";

const envValidationConfig = {
	RABBITMQ_PROTOCOL: str({ default: "amqp" }),
	RABBITMQ_HOST: str({ default: "localhost" }),
	RABBITMQ_PORT: num({ default: 5672 }),
	RABBITMQ_USER: str({ default: "guest" }),
	RABBITMQ_PASSWORD: str({ default: "guest" }),
	TELEGRAM_BOT_TOKEN: str(),
	TELEGRAM_CHANNELS: str({ default: "[]" }),
};

export default envValidationConfig;

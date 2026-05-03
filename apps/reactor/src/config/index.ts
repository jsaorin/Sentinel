import environment from "../env/reactor-environment.js";

export const reactorConfig = {
	amqpUrl: environment.amqpUrl,
	exchangeDefault: "reactor.events",
	prefetch: 10,
	manualAck: true,
	reactorPort: environment.reactorPort,
	alchemyGrpcEndpoint: environment.alchemyGrpcEndpoint,
	alchemyGrpcToken: environment.alchemyGrpcToken,
};

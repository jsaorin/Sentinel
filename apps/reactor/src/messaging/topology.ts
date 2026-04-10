import type { Channel, Options } from "amqplib";
import type { Subscription } from "./types.js";

const RETRY_EXCHANGE_SUFFIX = ".retry";

export function getRetryExchange(exchange: string): string {
	return `${exchange}${RETRY_EXCHANGE_SUFFIX}`;
}

export async function assertTopology(
	ch: Channel,
	subs: Subscription[],
	defaultExchange: string,
) {
	const exchanges = new Set<string>();
	const retryExchanges = new Set<string>();

	for (const s of subs) {
		const mainExchange = s.exchange || defaultExchange;
		exchanges.add(mainExchange);
		if (s.dlq?.exchange) exchanges.add(s.dlq.exchange);
		if (s.retry) retryExchanges.add(getRetryExchange(mainExchange));
	}

	for (const ex of exchanges) {
		await ch.assertExchange(ex, "topic", { durable: true });
	}

	for (const ex of retryExchanges) {
		await ch.assertExchange(ex, "topic", { durable: true });
	}

	for (const s of subs) {
		const args: Options.AssertQueue["arguments"] = {};
		if (s.dlq?.exchange) {
			args["x-dead-letter-exchange"] = s.dlq.exchange;
			args["x-dead-letter-routing-key"] = s.queue;
		}

		await ch.assertQueue(s.queue, { durable: true, arguments: args });
		for (const key of s.keys) {
			await ch.bindQueue(s.queue, s.exchange || defaultExchange, key);
		}

		if (s.retry) {
			const mainExchange = s.exchange || defaultExchange;
			const retryExchange = getRetryExchange(mainExchange);

			const retryArgs: Options.AssertQueue["arguments"] = {
				"x-dead-letter-exchange": mainExchange,
			};

			await ch.assertQueue(`${s.queue}.retry`, {
				durable: true,
				arguments: retryArgs,
			});

			for (const key of s.keys) {
				await ch.bindQueue(`${s.queue}.retry`, retryExchange, key);
			}
		}

		if (s.dlq) {
			await ch.assertQueue(s.dlq.queue, { durable: true });
			const dlqRoutingKey = s.queue;
			await ch.bindQueue(s.dlq.queue, s.dlq.exchange, dlqRoutingKey);
		}
	}
}

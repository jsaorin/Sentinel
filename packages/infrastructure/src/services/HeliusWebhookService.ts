import type { ILogger } from "@sentinel/common/logger";
import {
	DOMAIN_TYPES,
	type IHeliusWebhookService,
	type IWebhookConfigRepository,
	type WebhookType,
} from "@sentinel/domain";
import { inject, injectable } from "inversify";

interface HeliusApiConfig {
	apiKey: string;
}

interface HeliusWebhookResponse {
	webhookURL: string;
	transactionTypes: string[];
	accountAddresses: string[];
	webhookType: string;
	authHeader?: string;
	txnStatus?: string;
	encoding?: string;
}

@injectable()
export class HeliusWebhookService implements IHeliusWebhookService {
	constructor(
		@inject(DOMAIN_TYPES.HeliusApiConfig)
		private config: HeliusApiConfig,
		@inject(DOMAIN_TYPES.WebhookConfigRepository)
		private webhookConfigRepository: IWebhookConfigRepository,
		@inject(DOMAIN_TYPES.Logger)
		private logger: ILogger,
	) {}

	async addAddressToWebhook(
		address: string,
		webhookType: WebhookType,
	): Promise<void> {
		const webhookConfigs =
			await this.webhookConfigRepository.findByType(webhookType);

		if (webhookConfigs.length === 0) {
			throw new Error(
				`No webhook configs found for type ${webhookType}`,
			);
		}

		await Promise.all(
			webhookConfigs.map(async (config) => {
				const webhook = await this.getWebhookById(
					config.heliusWebhookId,
				);

				const accountAddresses = webhook.accountAddresses.concat([
					address,
				]);
				if (accountAddresses.length > 100_000) {
					throw new Error(
						"A single webhook cannot contain more than 100,000 addresses",
					);
				}

				await this.editWebhook(config.heliusWebhookId, {
					webhookURL: webhook.webhookURL,
					transactionTypes: webhook.transactionTypes,
					accountAddresses,
					webhookType: webhook.webhookType,
					authHeader: webhook.authHeader,
					txnStatus: webhook.txnStatus,
					encoding: webhook.encoding,
				});

				this.logger.info("Address added to Helius webhook", {
					address,
					webhookId: config.heliusWebhookId,
				});
			}),
		);
	}

	private async getWebhookById(
		webhookId: string,
	): Promise<HeliusWebhookResponse> {
		const url = `https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${this.config.apiKey}`;

		const response = await fetch(url);
		if (!response.ok) {
			const errorBody = await response.text();
			throw new Error(
				`Failed to get webhook ${webhookId}: ${response.status} ${errorBody}`,
			);
		}

		return response.json() as Promise<HeliusWebhookResponse>;
	}

	private async editWebhook(
		webhookId: string,
		body: {
			webhookURL: string;
			transactionTypes: string[];
			accountAddresses: string[];
			webhookType: string;
			authHeader?: string;
			txnStatus?: string;
			encoding?: string;
		},
	): Promise<void> {
		const url = `https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${this.config.apiKey}`;

		const response = await fetch(url, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorBody = await response.text();
			throw new Error(
				`Error during editWebhook: ${response.status} ${errorBody}`,
			);
		}
	}
}

import type { WebhookType } from "../entities/WebhookConfig.js";

export interface IHeliusWebhookService {
	addAddressToWebhook(
		address: string,
		webhookType: WebhookType,
	): Promise<void>;
}

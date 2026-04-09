import type { WebhookConfig, WebhookType } from "../entities/WebhookConfig.js";

export interface IWebhookConfigRepository {
	findById(id: string): Promise<WebhookConfig | null>;
	findByType(type: WebhookType): Promise<WebhookConfig[]>;
	create(config: WebhookConfig): Promise<WebhookConfig>;
	delete(id: string): Promise<void>;
}

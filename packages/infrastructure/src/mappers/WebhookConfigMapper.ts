import type { WebhookConfig as PrismaWebhookConfig } from "../../generated/client/index.js";
import { WebhookConfig, type WebhookType } from "@sentinel/domain";

export function mapPrismaWebhookConfigToDomain(
	record: PrismaWebhookConfig,
): WebhookConfig {
	return new WebhookConfig({
		id: record.id,
		heliusWebhookId: record.heliusWebhookId,
		type: record.type as WebhookType,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
	});
}

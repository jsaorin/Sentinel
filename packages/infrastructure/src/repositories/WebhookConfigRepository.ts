import type { WebhookConfig, WebhookType } from "@sentinel/domain";
import type { IWebhookConfigRepository } from "@sentinel/domain/repositories";
import { injectable } from "inversify";
import { mapPrismaWebhookConfigToDomain } from "../mappers/WebhookConfigMapper.js";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";

@injectable()
export class WebhookConfigRepository implements IWebhookConfigRepository {
	private get prisma() {
		return getPrismaClient();
	}

	async findById(id: string): Promise<WebhookConfig | null> {
		const record = await this.prisma.webhookConfig.findUnique({
			where: { id },
		});
		return record ? mapPrismaWebhookConfigToDomain(record) : null;
	}

	async findByType(type: WebhookType): Promise<WebhookConfig[]> {
		const records = await this.prisma.webhookConfig.findMany({
			where: { type },
		});
		return records.map(mapPrismaWebhookConfigToDomain);
	}

	async create(config: WebhookConfig): Promise<WebhookConfig> {
		const record = await this.prisma.webhookConfig.create({
			data: {
				heliusWebhookId: config.heliusWebhookId,
				type: config.type,
			},
		});
		return mapPrismaWebhookConfigToDomain(record);
	}

	async delete(id: string): Promise<void> {
		await this.prisma.webhookConfig.delete({ where: { id } });
	}
}

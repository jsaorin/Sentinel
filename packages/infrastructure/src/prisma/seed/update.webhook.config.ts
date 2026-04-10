import { WebhookType } from "@sentinel/domain";
import { getPrismaClient } from "../prisma-client-factory.js";

const multisigActivityWebhookConfigs = [
	{
		heliusWebhookId: "7767df74-6405-4c10-9666-08fd5f732f3f",
		type: WebhookType.MULTISIG_ACTIVITY,
	},
];

const ALL_WEBHOOK_CONFIGS = [...multisigActivityWebhookConfigs];

export class UpdateWebhooksConfigService {
	private get prisma() {
		return getPrismaClient();
	}

	async updateWebhooksConfig() {
		for (const webhookConfig of ALL_WEBHOOK_CONFIGS) {
			const savedWebhookConfig =
				await this.prisma.webhookConfig.findFirst({
					where: {
						type: webhookConfig.type,
					},
				});

			if (savedWebhookConfig) {
				await this.prisma.webhookConfig.update({
					where: { id: savedWebhookConfig.id },
					data: webhookConfig,
				});
			} else {
				await this.prisma.webhookConfig.create({ data: webhookConfig });
			}
		}
	}

	async runSeed() {
		try {
			await this.updateWebhooksConfig();
			console.info("Seed completed for model: Webhooks Config");
		} catch (error) {
			console.error("Error in runUpdate:", error);
			throw error;
		}
	}
}

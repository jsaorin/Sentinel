import { getPrismaClient } from "../prisma-client-factory.js";
import { UpdateWebhooksConfigService } from "./update.webhook.config.js";

const prisma = getPrismaClient();

async function seed(): Promise<void> {
	const updateWebhooksConfigService = new UpdateWebhooksConfigService();
	await updateWebhooksConfigService.runSeed();
}

async function main(): Promise<void> {
	let isError = false;
	try {
		await seed();
	} catch (e) {
		isError = true;
		console.error(e);
	} finally {
		await prisma.$disconnect();
		process.exit(isError ? 1 : 0);
	}
}

void main();

import { PrismaClient } from "../../generated/client/index.js";

let prismaClientInstance: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
	if (!prismaClientInstance) {
		prismaClientInstance = new PrismaClient();
	}

	return prismaClientInstance;
}

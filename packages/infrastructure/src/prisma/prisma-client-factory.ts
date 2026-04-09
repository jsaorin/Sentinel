import { PrismaPg } from "@prisma/adapter-pg";
import environment from "../config/environment.js";
import { PrismaClient } from "../../generated/client/index.js";

let prismaClientInstance: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
	if (!prismaClientInstance) {
		const adapter = new PrismaPg({
			connectionString: environment.dataBaseUrl,
		});
		prismaClientInstance = new PrismaClient({ adapter });
	}

	return prismaClientInstance;
}

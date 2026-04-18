import type { Prisma } from "../../generated/client/index.js";
import type {
	IMultisigScoreRepository,
	MultisigScore,
	UpsertMultisigScoreInput,
} from "@sentinel/domain";
import { injectable } from "inversify";
import { mapPrismaMultisigScoreToDomain } from "../mappers/MultisigScoreMapper.js";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";

@injectable()
export class MultisigScoreRepository implements IMultisigScoreRepository {
	private get prisma() {
		return getPrismaClient();
	}

	async findByMultisigId(multisigId: string): Promise<MultisigScore | null> {
		const record = await this.prisma.multisigScore.findUnique({
			where: { multisigId },
		});
		return record ? mapPrismaMultisigScoreToDomain(record) : null;
	}

	async upsert(input: UpsertMultisigScoreInput): Promise<MultisigScore> {
		const warningsJson = input.warnings as unknown as Prisma.InputJsonValue;
		const now = new Date();

		const record = await this.prisma.multisigScore.upsert({
			where: { multisigId: input.multisigId },
			create: {
				multisigId: input.multisigId,
				overallScore: input.overallScore,
				thresholdScore: input.thresholdScore,
				configAuthorityScore: input.configAuthorityScore,
				signerConcentrationScore: input.signerConcentrationScore,
				signerCountScore: input.signerCountScore,
				warnings: warningsJson,
				calculatedAt: now,
			},
			update: {
				overallScore: input.overallScore,
				thresholdScore: input.thresholdScore,
				configAuthorityScore: input.configAuthorityScore,
				signerConcentrationScore: input.signerConcentrationScore,
				signerCountScore: input.signerCountScore,
				warnings: warningsJson,
				calculatedAt: now,
			},
		});

		return mapPrismaMultisigScoreToDomain(record);
	}

	async updateAISummary(
		multisigId: string,
		aiSummary: string,
	): Promise<MultisigScore> {
		const record = await this.prisma.multisigScore.update({
			where: { multisigId },
			data: { aiSummary },
		});
		return mapPrismaMultisigScoreToDomain(record);
	}
}

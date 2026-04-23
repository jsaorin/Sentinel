import type { Prisma } from "../../generated/client/index.js";
import type {
	IProposalScoreRepository,
	ProposalScore,
	UpdateProposalAIFieldsInput,
	UpsertProposalScoreInput,
} from "@sentinel/domain";
import { injectable } from "inversify";
import { mapPrismaProposalScoreToDomain } from "../mappers/ProposalScoreMapper.js";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";

@injectable()
export class ProposalScoreRepository implements IProposalScoreRepository {
	private get prisma() {
		return getPrismaClient();
	}

	async findByProposalId(proposalId: string): Promise<ProposalScore | null> {
		const record = await this.prisma.proposalScore.findUnique({
			where: { proposalId },
		});
		return record ? mapPrismaProposalScoreToDomain(record) : null;
	}

	async findByProposalIds(proposalIds: string[]): Promise<ProposalScore[]> {
		if (proposalIds.length === 0) return [];
		const records = await this.prisma.proposalScore.findMany({
			where: { proposalId: { in: proposalIds } },
		});
		return records.map(mapPrismaProposalScoreToDomain);
	}

	async findByMultisigId(multisigId: string): Promise<ProposalScore[]> {
		const records = await this.prisma.proposalScore.findMany({
			where: { proposal: { multisigId } },
		});
		return records.map(mapPrismaProposalScoreToDomain);
	}

	async upsertMany(
		scores: UpsertProposalScoreInput[],
	): Promise<ProposalScore[]> {
		const results: ProposalScore[] = [];
		const now = new Date();

		for (const score of scores) {
			const flagsJson = score.flags as unknown as Prisma.InputJsonValue;

			const record = await this.prisma.proposalScore.upsert({
				where: { proposalId: score.proposalId },
				create: {
					proposalId: score.proposalId,
					riskScore: score.riskScore,
					flags: flagsJson,
					summary: score.summary,
					calculatedAt: now,
				},
				update: {
					riskScore: score.riskScore,
					flags: flagsJson,
					summary: score.summary,
					calculatedAt: now,
				},
			});

			results.push(mapPrismaProposalScoreToDomain(record));
		}

		return results;
	}

	async updateAIFields(
		proposalId: string,
		input: UpdateProposalAIFieldsInput,
	): Promise<ProposalScore> {
		const record = await this.prisma.proposalScore.update({
			where: { proposalId },
			data: {
				aiAnalysis: input.aiAnalysis,
				recommendation: input.recommendation,
			},
		});
		return mapPrismaProposalScoreToDomain(record);
	}
}

import type { DecodedInstruction } from "@sentinel/domain";
import type { IDecodedInstructionRepository } from "@sentinel/domain/repositories";
import { injectable } from "inversify";
import { mapPrismaDecodedInstructionToDomain } from "../mappers/DecodedInstructionMapper.js";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";

@injectable()
export class DecodedInstructionRepository
	implements IDecodedInstructionRepository
{
	private get prisma() {
		return getPrismaClient();
	}

	async findByProposalInstructionId(
		proposalInstructionId: string,
	): Promise<DecodedInstruction | null> {
		const record = await this.prisma.decodedInstruction.findUnique({
			where: { proposalInstructionId },
		});
		return record ? mapPrismaDecodedInstructionToDomain(record) : null;
	}

	async findByProposalInstructionIds(
		proposalInstructionIds: string[],
	): Promise<DecodedInstruction[]> {
		const records = await this.prisma.decodedInstruction.findMany({
			where: { proposalInstructionId: { in: proposalInstructionIds } },
		});
		return records.map(mapPrismaDecodedInstructionToDomain);
	}

	async upsertMany(
		decodedInstructions: Array<{
			proposalInstructionId: string;
			programName: string;
			action: string;
			params: Record<string, string>;
			accounts: Array<{ address: string; label: string }>;
			summary: string;
			isKnown: boolean;
		}>,
	): Promise<DecodedInstruction[]> {
		const results: DecodedInstruction[] = [];

		for (const decoded of decodedInstructions) {
			const record = await this.prisma.decodedInstruction.upsert({
				where: {
					proposalInstructionId: decoded.proposalInstructionId,
				},
				create: {
					proposalInstructionId: decoded.proposalInstructionId,
					programName: decoded.programName,
					action: decoded.action,
					params: decoded.params,
					accounts: decoded.accounts,
					summary: decoded.summary,
					isKnown: decoded.isKnown,
				},
				update: {
					programName: decoded.programName,
					action: decoded.action,
					params: decoded.params,
					accounts: decoded.accounts,
					summary: decoded.summary,
					isKnown: decoded.isKnown,
				},
			});
			results.push(mapPrismaDecodedInstructionToDomain(record));
		}

		return results;
	}

	async findUnknown(limit = 100): Promise<DecodedInstruction[]> {
		const records = await this.prisma.decodedInstruction.findMany({
			where: { isKnown: false },
			take: limit,
		});
		return records.map(mapPrismaDecodedInstructionToDomain);
	}
}

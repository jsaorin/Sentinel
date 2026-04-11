import type { ProposalInstruction } from "@sentinel/domain";
import type { IProposalInstructionRepository } from "@sentinel/domain/repositories";
import { injectable } from "inversify";
import { mapPrismaProposalInstructionToDomain } from "../mappers/ProposalInstructionMapper.js";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";

@injectable()
export class ProposalInstructionRepository
	implements IProposalInstructionRepository
{
	private get prisma() {
		return getPrismaClient();
	}

	async findByProposalId(proposalId: string): Promise<ProposalInstruction[]> {
		const records = await this.prisma.proposalInstruction.findMany({
			where: { proposalId },
			orderBy: { instructionIndex: "asc" },
		});
		return records.map(mapPrismaProposalInstructionToDomain);
	}

	async findByProposalIds(
		proposalIds: string[],
	): Promise<ProposalInstruction[]> {
		const records = await this.prisma.proposalInstruction.findMany({
			where: { proposalId: { in: proposalIds } },
			orderBy: { instructionIndex: "asc" },
		});
		return records.map(mapPrismaProposalInstructionToDomain);
	}

	async createMany(
		instructions: Array<{
			proposalId: string;
			instructionIndex: number;
			programId: string;
			data: string;
			accounts: string[];
		}>,
	): Promise<ProposalInstruction[]> {
		const results: ProposalInstruction[] = [];

		for (const instruction of instructions) {
			const record = await this.prisma.proposalInstruction.create({
				data: {
					proposalId: instruction.proposalId,
					instructionIndex: instruction.instructionIndex,
					programId: instruction.programId,
					data: instruction.data,
					accounts: instruction.accounts,
				},
			});
			results.push(mapPrismaProposalInstructionToDomain(record));
		}

		return results;
	}
}

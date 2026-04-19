import type {
	IProgramRepository,
	Program,
	UpsertProgramInput,
} from "@sentinel/domain";
import { injectable } from "inversify";
import { mapPrismaProgramToDomain } from "../mappers/ProgramMapper.js";
import { getPrismaClient } from "../prisma/prisma-client-factory.js";

@injectable()
export class ProgramRepository implements IProgramRepository {
	private get prisma() {
		return getPrismaClient();
	}

	async findByProgramId(programId: string): Promise<Program | null> {
		const record = await this.prisma.program.findUnique({
			where: { programId },
		});
		return record ? mapPrismaProgramToDomain(record) : null;
	}

	async upsert(input: UpsertProgramInput): Promise<Program> {
		const data = {
			name: input.name ?? null,
			idlJson: (input.idlJson ?? null) as never,
			idlVersion: input.idlVersion ?? null,
			idlSource: input.idlSource,
			idlChecksum: input.idlChecksum ?? null,
			idlFetchedAt: input.idlFetchedAt ?? null,
		};
		const record = await this.prisma.program.upsert({
			where: { programId: input.programId },
			create: { programId: input.programId, ...data },
			update: data,
		});
		return mapPrismaProgramToDomain(record);
	}

	async invalidate(programId: string): Promise<void> {
		// Cascade clear all decoded instructions for this program so they get
		// re-decoded on next pass when the IDL changed materially.
		await this.prisma.decodedInstruction.deleteMany({
			where: {
				proposalInstruction: {
					programId,
				},
			},
		});
	}
}

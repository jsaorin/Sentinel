import { Program, type ProgramIdlSource } from "@sentinel/domain";
import type { Program as PrismaProgram } from "../../generated/client/index.js";

export function mapPrismaProgramToDomain(record: PrismaProgram): Program {
	return new Program({
		id: record.id,
		programId: record.programId,
		name: record.name,
		idlJson: record.idlJson,
		idlVersion: record.idlVersion,
		idlSource: record.idlSource as ProgramIdlSource,
		idlChecksum: record.idlChecksum,
		idlFetchedAt: record.idlFetchedAt,
		firstSeenAt: record.firstSeenAt,
		lastSeenAt: record.lastSeenAt,
	});
}

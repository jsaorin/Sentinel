import type { Program, ProgramIdlSource } from "../entities/Program.js";

export interface UpsertProgramInput {
	programId: string;
	name?: string | null;
	idlJson?: unknown | null;
	idlVersion?: string | null;
	idlSource: ProgramIdlSource;
	idlChecksum?: string | null;
	idlFetchedAt?: Date | null;
}

export interface IProgramRepository {
	findByProgramId(programId: string): Promise<Program | null>;
	upsert(input: UpsertProgramInput): Promise<Program>;
	invalidate(programId: string): Promise<void>;
}

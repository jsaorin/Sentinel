import type { DecodedInstruction } from "../entities/DecodedInstruction.js";

export interface IDecodedInstructionRepository {
	findByProposalInstructionId(
		proposalInstructionId: string,
	): Promise<DecodedInstruction | null>;
	findByProposalInstructionIds(
		proposalInstructionIds: string[],
	): Promise<DecodedInstruction[]>;
	upsertMany(
		decodedInstructions: Array<{
			proposalInstructionId: string;
			programName: string;
			action: string;
			params: Record<string, string>;
			accounts: Array<{ address: string; label: string }>;
			summary: string;
			isKnown: boolean;
		}>,
	): Promise<DecodedInstruction[]>;
	findUnknown(limit?: number): Promise<DecodedInstruction[]>;
}

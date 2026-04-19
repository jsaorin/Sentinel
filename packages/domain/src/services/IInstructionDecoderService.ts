import type { ProposalInstruction } from "../entities/ProposalInstruction.js";

export interface DecodedInstructionData {
	proposalInstructionId: string;
	programName: string;
	action: string;
	params: Record<string, string>;
	accounts: Array<{ address: string; label: string }>;
	summary: string;
	isKnown: boolean;
}

export interface IInstructionDecoderService {
	decode(
		instructions: ProposalInstruction[],
	): Promise<DecodedInstructionData[]>;
}

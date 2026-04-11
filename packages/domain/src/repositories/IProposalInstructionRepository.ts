import type { ProposalInstruction } from "../entities/ProposalInstruction.js";

export interface IProposalInstructionRepository {
	findByProposalId(proposalId: string): Promise<ProposalInstruction[]>;
	findByProposalIds(proposalIds: string[]): Promise<ProposalInstruction[]>;
	createMany(
		instructions: Array<{
			proposalId: string;
			instructionIndex: number;
			programId: string;
			data: string;
			accounts: string[];
		}>,
	): Promise<ProposalInstruction[]>;
}

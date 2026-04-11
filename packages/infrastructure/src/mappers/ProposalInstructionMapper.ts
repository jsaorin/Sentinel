import type { ProposalInstruction as PrismaProposalInstruction } from "../../generated/client/index.js";
import { ProposalInstruction } from "@sentinel/domain";

export function mapPrismaProposalInstructionToDomain(
	record: PrismaProposalInstruction,
): ProposalInstruction {
	return new ProposalInstruction({
		id: record.id,
		proposalId: record.proposalId,
		instructionIndex: record.instructionIndex,
		programId: record.programId,
		data: record.data,
		accounts: record.accounts,
	});
}

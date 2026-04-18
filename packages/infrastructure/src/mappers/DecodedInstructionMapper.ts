import type { DecodedInstruction as PrismaDecodedInstruction } from "../../generated/client/index.js";
import { DecodedInstruction } from "@sentinel/domain";

export function mapPrismaDecodedInstructionToDomain(
	record: PrismaDecodedInstruction,
): DecodedInstruction {
	return new DecodedInstruction({
		id: record.id,
		proposalInstructionId: record.proposalInstructionId,
		programName: record.programName,
		action: record.action,
		params: record.params as Record<string, string>,
		accounts: record.accounts as Array<{ address: string; label: string }>,
		summary: record.summary,
		isKnown: record.isKnown,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
	});
}

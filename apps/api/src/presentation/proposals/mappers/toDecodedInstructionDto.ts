import type { GetProposalDetailQueryOutputInstruction } from "@sentinel/application";
import type { DecodedInstructionDto } from "@sentinel/common/dtos";

export function toDecodedInstructionDto(
	entry: GetProposalDetailQueryOutputInstruction,
): DecodedInstructionDto {
	const { instruction, decoded } = entry;
	return {
		instructionIndex: instruction.instructionIndex,
		programId: instruction.programId,
		programName: decoded?.programName ?? "Unknown Program",
		action: decoded?.action ?? "Unknown",
		params: decoded?.params ?? {},
		accounts: decoded
			? decoded.accounts
			: instruction.accounts.map((address, index) => ({
					address,
					label: `account_${index}`,
				})),
		rawData: instruction.data,
		isKnown: decoded?.isKnown ?? false,
	};
}

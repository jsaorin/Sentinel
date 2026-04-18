import type { ProposalInstruction } from "@sentinel/domain";

export type DecodeInstructionsCommandInputDto = {
	instructions: ProposalInstruction[];
};

export type DecodeInstructionsCommandOutputDto = {
	decoded: number;
	unknown: number;
	total: number;
};

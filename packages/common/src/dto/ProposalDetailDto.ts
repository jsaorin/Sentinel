import type { DecodedInstructionDto } from "./DecodedInstructionDto.js";
import type { ProposalFlagDto } from "./ProposalFlagDto.js";
import type { ProposalSignerDto } from "./ProposalSignerDto.js";

export class ProposalDetailDto {
	id: string;
	proposalIndex: number;
	transactionIndex: number;
	status: string;
	creator: string | null;
	createdAt: string;
	executedAt: string | null;

	multisig: {
		address: string;
		label: string | null;
		threshold: number | null;
		totalSigners: number;
	};

	scoring: {
		riskScore: number;
		flags: ProposalFlagDto[];
		summary: string;
		calculatedAt: string;
	} | null;

	ai: {
		analysis: string;
		recommendation: string;
	} | null;

	signers: ProposalSignerDto[];

	instructions: DecodedInstructionDto[];
}

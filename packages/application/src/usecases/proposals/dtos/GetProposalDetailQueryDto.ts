import type {
	DecodedInstruction,
	ProposalFlag,
	ProposalInstruction,
	Signer,
} from "@sentinel/domain";

export type GetProposalDetailQueryInputDto = {
	proposalId: string;
};

export type GetProposalDetailQueryOutputSigner = {
	signer: Signer;
	totalProposalsInMultisig: number;
};

export type GetProposalDetailQueryOutputInstruction = {
	instruction: ProposalInstruction;
	decoded: DecodedInstruction | null;
};

export type GetProposalDetailQueryOutputDto = {
	id: string;
	proposalIndex: number;
	transactionIndex: number;
	status: string;
	creator: string | null;
	createdAt: Date;
	executedAt: Date | null;

	multisig: {
		address: string;
		label: string | null;
		threshold: number | null;
		totalSigners: number;
	};

	scoring: {
		riskScore: number;
		flags: ProposalFlag[];
		summary: string;
		calculatedAt: Date;
	} | null;

	ai: {
		analysis: string;
		recommendation: string;
	} | null;

	signers: GetProposalDetailQueryOutputSigner[];

	instructions: GetProposalDetailQueryOutputInstruction[];
};

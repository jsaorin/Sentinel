export type ListProposalsQueryInputDto = {
	address: string;
};

export type ListProposalsQueryOutputProposal = {
	id: string;
	proposalIndex: number;
	transactionIndex: number;
	pda: string;
	transactionPda: string;
	status: string;
	creator: string | null;
	createdAt: Date;
	executedAt: Date | null;
	riskScore: number | null;
	summary: string | null;
	instructions: Array<{
		instructionIndex: number;
		programId: string;
		data: string;
		accounts: string[];
	}>;
};

export type ListProposalsQueryOutputDto = {
	proposals: ListProposalsQueryOutputProposal[];
};

export type ListProposalsQueryInputDto = {
	address: string;
	page: number;
	pageSize: number;
};

export type ListProposalsQueryPagination = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
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
	pagination: ListProposalsQueryPagination;
};

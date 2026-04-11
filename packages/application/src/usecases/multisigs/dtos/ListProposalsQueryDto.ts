export type ListProposalsQueryInputDto = {
	multisigId: string;
};

export type ListProposalsQueryOutputDto = {
	proposals: Array<{
		id: string;
		proposalIndex: number;
		transactionIndex: number;
		pda: string;
		transactionPda: string;
		status: string;
		creator: string | null;
		createdAt: Date;
		executedAt: Date | null;
		instructions: Array<{
			instructionIndex: number;
			programId: string;
			data: string;
			accounts: string[];
		}>;
	}>;
};

export class ProposalDto {
	id: string;
	proposalIndex: number;
	transactionIndex: number;
	pda: string;
	transactionPda: string;
	status: string;
	creator: string | null;
	createdAt: string;
	executedAt: string | null;
	riskScore: number | null;
	summary: string | null;
	instructions: Array<{
		instructionIndex: number;
		programId: string;
		data: string;
		accounts: string[];
	}>;
}

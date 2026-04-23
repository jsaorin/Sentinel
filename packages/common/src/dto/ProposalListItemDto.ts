export class ProposalListItemDto {
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
	multisig: {
		address: string;
		label: string | null;
	};
}

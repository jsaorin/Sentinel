export interface MultisigAccountData {
	threshold: number;
	members: Array<{ address: string; permissions: { mask: number } }>;
	configAuthority: string | null;
	transactionIndex: number;
}

export interface ProposalAccountData {
	proposalIndex: number;
	transactionIndex: number;
	pda: string;
	transactionPda: string;
	status: string;
	creator: string | null;
	createdAt: Date;
	executedAt: Date | null;
}

export interface ISquadsService {
	getMultisigAccountData(address: string): Promise<MultisigAccountData>;
	getProposals(
		multisigAddress: string,
		transactionIndex: number,
		startIndex?: number,
	): Promise<ProposalAccountData[]>;
}

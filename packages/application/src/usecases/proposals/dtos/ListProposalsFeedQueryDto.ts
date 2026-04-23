import type { ProposalSortField, ProposalStatus } from "@sentinel/domain";

export type ListProposalsFeedQueryInputDto = {
	page: number;
	pageSize: number;
	sortBy: ProposalSortField;
	status?: ProposalStatus;
};

export type ListProposalsFeedQueryOutputItem = {
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
	multisig: {
		address: string;
		label: string | null;
	};
};

export type ListProposalsFeedQueryPagination = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

export type ListProposalsFeedQueryOutputDto = {
	proposals: ListProposalsFeedQueryOutputItem[];
	pagination: ListProposalsFeedQueryPagination;
};

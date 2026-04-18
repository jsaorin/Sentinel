export type ListMultisigsQueryInputDto = Record<string, never>;

export type ListMultisigsQueryOutputItem = {
	id: string;
	address: string;
	label: string | null;
	threshold: number | null;
	totalSigners: number;
	healthScore: number | null;
	activeProposals: number;
	lastActivity: Date | null;
	createdAt: Date;
};

export type ListMultisigsQueryOutputDto = {
	multisigs: ListMultisigsQueryOutputItem[];
};

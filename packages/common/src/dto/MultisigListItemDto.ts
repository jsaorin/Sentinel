export class MultisigListItemDto {
	id: string;
	address: string;
	label: string | null;
	threshold: number | null;
	totalSigners: number;
	healthScore: number | null;
	activeProposals: number;
	lastActivity: string | null;
	createdAt: string;
}

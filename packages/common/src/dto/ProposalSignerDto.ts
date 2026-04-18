export class ProposalSignerDto {
	address: string;
	permissions: {
		mask: number;
		initiate: boolean;
		vote: boolean;
		execute: boolean;
	};
	totalProposalsInMultisig: number;
}

import type { Proposal } from "@sentinel/domain";

export type IngestNewProposalsCommandInputDto = {
	multisigId: string;
	address: string;
	transactionIndex: number;
};

export type IngestNewProposalsCommandOutputDto = {
	newProposals: Proposal[];
};

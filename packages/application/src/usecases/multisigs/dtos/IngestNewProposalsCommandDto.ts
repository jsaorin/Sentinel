import type { Proposal } from "@sentinel/domain";

export type IngestNewProposalsCommandInputDto = {
	multisigId: string;
	address: string;
	transactionIndex: number;
	/** Slot of the webhook source tx; forwarded as RPC minContextSlot. */
	slot?: number;
};

export type IngestNewProposalsCommandOutputDto = {
	newProposals: Proposal[];
};

export type ReconcileProposalCommandInputDto = {
	multisigId: string;
	multisigAddress: string;
	indices: number[];
	/** Slot of the webhook source tx; forwarded as RPC minContextSlot. */
	slot?: number;
};

export type ReconcileProposalCommandOutputDto = {
	updated: number;
	missing: number[];
};

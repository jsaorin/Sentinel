export type ReconcileProposalCommandInputDto = {
	multisigId: string;
	multisigAddress: string;
	indices: number[];
};

export type ReconcileProposalCommandOutputDto = {
	updated: number;
	missing: number[];
};

export type CreateMultisigCommandInputDto = {
	address: string;
	label?: string;
};

export type CreateMultisigCommandOutputDto = {
	id: string;
	address: string;
	label: string | null;
	createdAt: string;
};

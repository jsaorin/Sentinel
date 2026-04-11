export type ListSignersQueryInputDto = {
	address: string;
};

export type ListSignersQueryOutputDto = {
	signers: Array<{
		id: string;
		address: string;
		permissions: { mask: number };
	}>;
};

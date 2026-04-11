export type GetMultisigQueryInputDto = {
	address: string;
};

export type GetMultisigQueryOutputDto = {
	id: string;
	address: string;
	label: string | null;
	threshold: number | null;
	configAuthority: string | null;
	vaults: Array<{ vaultIndex: number; pda: string }>;
	createdAt: Date;
};

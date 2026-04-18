import type { MultisigScore } from "@sentinel/domain";

export type GetMultisigQueryInputDto = {
	address: string;
};

export type GetMultisigQueryOutputDto = {
	id: string;
	address: string;
	label: string | null;
	threshold: number | null;
	configAuthority: string | null;
	totalSigners: number;
	vaults: Array<{ vaultIndex: number; pda: string }>;
	healthScore: MultisigScore | null;
	createdAt: Date;
};

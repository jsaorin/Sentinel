import type { MultisigScoreDto } from "./MultisigScoreDto.js";

export class MultisigDto {
	id: string;
	address: string;
	label: string | null;
	threshold: number | null;
	configAuthority: string | null;
	totalSigners: number;
	vaults: Array<{ vaultIndex: number; pda: string }>;
	healthScore: MultisigScoreDto | null;
	createdAt: string;
}

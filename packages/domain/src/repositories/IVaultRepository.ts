import type { Vault } from "../entities/Vault.js";

export interface IVaultRepository {
	findByMultisigId(multisigId: string): Promise<Vault[]>;
	upsert(data: {
		multisigId: string;
		vaultIndex: number;
		pda: string;
	}): Promise<Vault>;
}

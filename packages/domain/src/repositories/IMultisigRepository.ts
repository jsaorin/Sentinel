import type { Multisig } from "../entities/Multisig.js";

export interface IMultisigRepository {
	findById(id: string): Promise<Multisig | null>;
	findByAddress(address: string): Promise<Multisig | null>;
	create(data: { address: string; label?: string | null }): Promise<Multisig>;
}

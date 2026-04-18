import type { Multisig } from "../entities/Multisig.js";

export interface IMultisigRepository {
	findAll(): Promise<Multisig[]>;
	findById(id: string): Promise<Multisig | null>;
	findByAddress(address: string): Promise<Multisig | null>;
	create(data: { address: string; label?: string | null }): Promise<Multisig>;
	update(
		id: string,
		data: { threshold?: number; configAuthority?: string | null },
	): Promise<Multisig>;
}

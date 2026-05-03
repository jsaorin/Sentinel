import type { Signer } from "../entities/Signer.js";

export interface ISignerRepository {
	findByMultisigId(multisigId: string): Promise<Signer[]>;
	/**
	 * Returns all `Signer` rows whose `address` matches the given pubkey.
	 * A single pubkey may be a member of multiple multisigs, so this returns
	 * an array.
	 */
	findByAddress(address: string): Promise<Signer[]>;
	/**
	 * Returns the distinct list of every signer address tracked across all
	 * multisigs. Used by the nonce subscriber to seed its filter set on boot.
	 */
	findAllAddresses(): Promise<string[]>;
	createMany(
		signers: Array<{
			address: string;
			multisigId: string;
			permissions: { mask: number };
		}>,
	): Promise<Signer[]>;
	deleteByMultisigId(multisigId: string): Promise<void>;
}

import type { Signer } from "../entities/Signer.js";

export interface ISignerRepository {
	findByMultisigId(multisigId: string): Promise<Signer[]>;
	createMany(
		signers: Array<{
			address: string;
			multisigId: string;
			permissions: { mask: number };
		}>,
	): Promise<Signer[]>;
	deleteByMultisigId(multisigId: string): Promise<void>;
}

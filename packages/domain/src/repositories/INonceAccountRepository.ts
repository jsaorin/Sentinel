import type { NonceAccount } from "../entities/NonceAccount.js";

export interface CreateNonceAccountInput {
	address: string;
	authority: string;
	fundedBy: string | null;
	multisigId: string;
	signerId: string;
	externallyFunded: boolean;
}

export interface INonceAccountRepository {
	findByMultisigId(multisigId: string): Promise<NonceAccount[]>;
	findExistingAddresses(addresses: string[]): Promise<Set<string>>;
	createMany(items: CreateNonceAccountInput[]): Promise<NonceAccount[]>;
}

/**
 * Scans Solana for Durable Nonce accounts whose `authority` field matches a
 * given pubkey.
 *
 * The current production implementation polls via `getProgramAccounts` with a
 * `memcmp` filter on the authority offset. This works fine up to a few hundred
 * tracked signers but does not scale further.
 *
 * TODO(geyser-migration): replace polling with a push-based stream subscription
 * (Helius LaserStream / Yellowstone gRPC / a self-hosted Geyser plugin). The
 * port shape stays the same; only the implementation swaps. See plan file
 * "Detector de Durable Nonce accounts apuntando a signers trackeados".
 */
export interface NonceAccountSnapshot {
	address: string;
	authority: string;
	fundedBy: string | null;
}

export interface INonceAccountScanner {
	scanForAuthority(authority: string): Promise<NonceAccountSnapshot[]>;
}

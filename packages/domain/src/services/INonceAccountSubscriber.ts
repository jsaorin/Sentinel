/**
 * Subscribes to a real-time stream of Solana account writes and delivers, via
 * a callback, every event whose data matches the Durable Nonce layout
 * (80 bytes) AND whose authority field (offset 8..40) matches one of the
 * registered authorities.
 *
 * The subscriber maintains a single persistent gRPC connection to a Yellowstone
 * provider. Filters are applied SERVER-SIDE so only matching account updates
 * traverse the wire — bandwidth is proportional to actual matches, which is
 * tiny in practice (signers rarely have nonce accounts authorized to them).
 *
 * This is the only viable mechanism to detect "a Durable Nonce just got
 * created with a tracked signer as authority" in real-time. Polling against
 * SystemProgram via JSON-RPC `getProgramAccounts` is impossible because no
 * RPC provider exposes a content-indexed lookup over the program. See the
 * project's plan file for the full reasoning.
 */
export interface NonceAccountMatchEvent {
	/** Pubkey of the new/updated nonce account (base58). */
	address: string;
	/** Pubkey at offset 8..40 of the account data (base58). */
	authority: string;
	/** Wallet that funded the account creation, if resolvable; null otherwise. */
	fundedBy: string | null;
	/** Slot at which the update was observed. */
	slot: number;
}

export type NonceAccountMatchHandler = (
	event: NonceAccountMatchEvent,
) => Promise<void>;

export interface INonceAccountSubscriber {
	/**
	 * Open the gRPC subscription with the initial authority set. The handler
	 * will be invoked once per match. Reconnects automatically on transient
	 * errors.
	 */
	start(
		authorities: string[],
		handler: NonceAccountMatchHandler,
	): Promise<void>;

	/** Add an authority to the active filter. The subscription is refreshed. */
	addAuthority(authority: string): Promise<void>;

	/** Remove an authority. The subscription is refreshed. */
	removeAuthority(authority: string): Promise<void>;

	/** Returns the current list of authorities being filtered. */
	getAuthorities(): string[];

	/** Close the subscription. */
	stop(): Promise<void>;
}

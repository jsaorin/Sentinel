export type HeliusEventKind = "config-change" | "proposal-action" | "unknown";

export interface ClassifiedHeliusEvent {
	multisigAddress: string;
	kind: HeliusEventKind;
	proposalPda?: string;
	/**
	 * Slot at which the source transaction was confirmed. Forwarded to RPC
	 * reads as `minContextSlot` so the reactor never reads from a node that's
	 * still behind the webhook's slot.
	 */
	slot?: number;
}

export interface IHeliusPayloadClassifier {
	classify(payload: unknown): ClassifiedHeliusEvent | null;
}

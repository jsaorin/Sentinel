export type HeliusEventKind = "config-change" | "proposal-action" | "unknown";

export interface ClassifiedHeliusEvent {
	multisigAddress: string;
	kind: HeliusEventKind;
	proposalPda?: string;
}

export interface IHeliusPayloadClassifier {
	classify(payload: unknown): ClassifiedHeliusEvent | null;
}

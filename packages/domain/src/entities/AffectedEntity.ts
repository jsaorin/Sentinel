export type AffectedEntityKind = "program" | "multisig" | "wallet";

export type AffectedEntityRole =
	| "attacker"
	| "victim"
	| "compromised"
	| "vulnerable"
	| "unknown";

export class AffectedEntity {
	constructor(
		public readonly kind: AffectedEntityKind,
		public readonly address: string,
		public readonly role: AffectedEntityRole | null = null,
		public readonly contextSnippet: string | null = null,
		public readonly id: string | null = null,
	) {}
}

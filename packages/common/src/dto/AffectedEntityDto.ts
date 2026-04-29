export class AffectedEntityDto {
	kind: "program" | "multisig" | "wallet";
	address: string;
	role: "attacker" | "victim" | "compromised" | "vulnerable" | "unknown" | null;
	contextSnippet: string | null;
}

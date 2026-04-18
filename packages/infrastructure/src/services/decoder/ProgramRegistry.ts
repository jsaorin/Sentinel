const PROGRAM_REGISTRY: Record<string, string> = {
	"11111111111111111111111111111111": "System Program",
	TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "Token Program",
	TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb: "Token 2022 Program",
	BPFLoaderUpgradeab1e11111111111111111111111: "BPF Upgradeable Loader",
	ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: "Associated Token Program",
	ComputeBudget111111111111111111111111111111: "Compute Budget Program",
	SMPLecH534NA9acpos4G6x7uf3LWbCAwZQE9e8ZekMu: "Squads Multisig Program",
	SysvarRent111111111111111111111111111111111: "Sysvar Rent",
	SysvarC1ock11111111111111111111111111111111: "Sysvar Clock",
	Stake11111111111111111111111111111111111111: "Stake Program",
	Vote111111111111111111111111111111111111111: "Vote Program",
	MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr: "Memo Program",
	memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo: "Memo Program (v1)",
};

export function getProgramName(programId: string): string | null {
	return PROGRAM_REGISTRY[programId] ?? null;
}

export function isKnownProgram(programId: string): boolean {
	return programId in PROGRAM_REGISTRY;
}

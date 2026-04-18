interface LabeledAccount {
	address: string;
	label: string;
}

type AccountLabels = string[];

const ACCOUNT_LABELS: Record<string, Record<string, AccountLabels>> = {
	"System Program": {
		CreateAccount: ["source", "newAccount", "owner"],
		Transfer: ["source", "destination"],
		AdvanceNonceAccount: [
			"nonceAccount",
			"recentBlockhashes",
			"nonceAuthority",
		],
		InitializeNonceAccount: ["nonceAccount", "recentBlockhashes", "authority"],
		AuthorizeNonceAccount: ["nonceAccount", "newAuthority"],
		WithdrawNonceAccount: [
			"nonceAccount",
			"destination",
			"recentBlockhashes",
			"rent",
			"nonceAuthority",
		],
	},
	"BPF Upgradeable Loader": {
		Upgrade: ["programData", "program", "buffer", "spillAccount", "rent", "clock", "authority"],
		SetAuthority: ["account", "currentAuthority", "newAuthority"],
		Close: ["account", "recipient", "authority", "program"],
	},
	"Token Program": {
		Transfer: ["source", "destination", "authority"],
		TransferChecked: ["source", "mint", "destination", "authority"],
		Approve: ["source", "delegate", "authority"],
		Revoke: ["source", "authority"],
		SetAuthority: ["account", "currentAuthority"],
		MintTo: ["mint", "destination", "mintAuthority"],
		Burn: ["source", "mint", "authority"],
		CloseAccount: ["account", "destination", "authority"],
		InitializeAccount: ["account", "mint", "owner", "rent"],
	},
	"Token 2022 Program": {
		Transfer: ["source", "destination", "authority"],
		TransferChecked: ["source", "mint", "destination", "authority"],
		Approve: ["source", "delegate", "authority"],
		SetAuthority: ["account", "currentAuthority"],
		MintTo: ["mint", "destination", "mintAuthority"],
		Burn: ["source", "mint", "authority"],
		CloseAccount: ["account", "destination", "authority"],
	},
	"Associated Token Program": {
		CreateAssociatedTokenAccount: [
			"payer",
			"associatedTokenAccount",
			"owner",
			"mint",
			"systemProgram",
			"tokenProgram",
		],
	},
};

export function labelAccounts(
	programName: string,
	action: string,
	accounts: string[],
): LabeledAccount[] {
	const labels = ACCOUNT_LABELS[programName]?.[action];

	return accounts.map((address, index) => ({
		address,
		label: labels?.[index] ?? `account_${index}`,
	}));
}

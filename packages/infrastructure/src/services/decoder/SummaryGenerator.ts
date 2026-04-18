interface LabeledAccount {
	address: string;
	label: string;
}

const LAMPORTS_PER_SOL = 1_000_000_000;

function truncateAddress(address: string): string {
	if (address.length <= 8) return address;
	return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatSol(lamports: string): string {
	const value = Number(lamports) / LAMPORTS_PER_SOL;
	if (value >= 1) return `${value.toLocaleString("en-US", { maximumFractionDigits: 4 })} SOL`;
	return `${lamports} lamports`;
}

function findAccount(
	accounts: LabeledAccount[],
	label: string,
): string | null {
	const account = accounts.find((a) => a.label === label);
	return account ? truncateAddress(account.address) : null;
}

export function generateSummary(
	programName: string,
	action: string,
	params: Record<string, string>,
	accounts: LabeledAccount[],
): string {
	switch (programName) {
		case "System Program":
			return generateSystemSummary(action, params, accounts);
		case "BPF Upgradeable Loader":
			return generateBpfSummary(action, params, accounts);
		case "Token Program":
		case "Token 2022 Program":
			return generateTokenSummary(action, params, accounts);
		case "Compute Budget Program":
			return generateComputeBudgetSummary(action, params);
		case "Associated Token Program":
			return generateAtaSummary(action, accounts);
		case "Squads Multisig Program":
			return "Squads multisig instruction";
		default:
			return `Unknown instruction on ${programName || "unknown program"}`;
	}
}

function generateSystemSummary(
	action: string,
	params: Record<string, string>,
	accounts: LabeledAccount[],
): string {
	switch (action) {
		case "Transfer": {
			const dest = findAccount(accounts, "destination");
			return `Transfer ${formatSol(params.lamports ?? "0")} to ${dest ?? "unknown"}`;
		}
		case "AdvanceNonceAccount": {
			const authority = findAccount(accounts, "nonceAuthority");
			return `Advance durable nonce (authority: ${authority ?? "unknown"})`;
		}
		case "CreateAccount": {
			const newAcc = findAccount(accounts, "newAccount");
			return `Create account ${newAcc ?? "unknown"} with ${formatSol(params.lamports ?? "0")}`;
		}
		case "InitializeNonceAccount": {
			const auth = findAccount(accounts, "authority");
			return `Initialize nonce account (authority: ${auth ?? "unknown"})`;
		}
		case "AuthorizeNonceAccount": {
			const newAuth = findAccount(accounts, "newAuthority");
			return `Authorize nonce account to ${newAuth ?? "unknown"}`;
		}
		case "WithdrawNonceAccount":
			return `Withdraw ${formatSol(params.lamports ?? "0")} from nonce account`;
		default:
			return `System Program: ${action}`;
	}
}

function generateBpfSummary(
	action: string,
	params: Record<string, string>,
	accounts: LabeledAccount[],
): string {
	switch (action) {
		case "SetAuthority": {
			const newAuth =
				params.newAuthority && params.newAuthority !== "none"
					? truncateAddress(params.newAuthority)
					: "none (revoked)";
			return `Set upgrade authority to ${newAuth}`;
		}
		case "Upgrade": {
			const program = findAccount(accounts, "program");
			return `Upgrade program ${program ?? "unknown"}`;
		}
		case "Close": {
			const account = findAccount(accounts, "account");
			return `Close program account ${account ?? "unknown"}`;
		}
		default:
			return `BPF Loader: ${action}`;
	}
}

function generateTokenSummary(
	action: string,
	params: Record<string, string>,
	accounts: LabeledAccount[],
): string {
	switch (action) {
		case "Transfer": {
			const dest = findAccount(accounts, "destination");
			return `Transfer ${params.amount ?? "?"} tokens to ${dest ?? "unknown"}`;
		}
		case "TransferChecked": {
			const dest = findAccount(accounts, "destination");
			const decimals = Number.parseInt(params.decimals ?? "0", 10);
			const amount = Number(params.amount ?? "0") / 10 ** decimals;
			return `Transfer ${amount} tokens to ${dest ?? "unknown"}`;
		}
		case "SetAuthority": {
			const type = params.authorityType ?? "unknown";
			return `Set ${type} authority (new: ${params.newAuthority === "none" ? "revoked" : "updated"})`;
		}
		case "MintTo": {
			const dest = findAccount(accounts, "destination");
			return `Mint ${params.amount ?? "?"} tokens to ${dest ?? "unknown"}`;
		}
		case "Burn":
			return `Burn ${params.amount ?? "?"} tokens`;
		case "Approve": {
			const delegate = findAccount(accounts, "delegate");
			return `Approve ${params.amount ?? "?"} tokens to delegate ${delegate ?? "unknown"}`;
		}
		case "Revoke":
			return "Revoke token delegation";
		case "CloseAccount": {
			const dest = findAccount(accounts, "destination");
			return `Close token account (rent to ${dest ?? "unknown"})`;
		}
		case "InitializeAccount":
			return "Initialize token account";
		default:
			return `Token Program: ${action}`;
	}
}

function generateComputeBudgetSummary(
	action: string,
	params: Record<string, string>,
): string {
	switch (action) {
		case "SetComputeUnitLimit":
			return `Set compute unit limit to ${Number(params.units ?? 0).toLocaleString()}`;
		case "SetComputeUnitPrice":
			return `Set compute unit price to ${params.microLamports ?? "0"} microLamports`;
		default:
			return `Compute Budget: ${action}`;
	}
}

function generateAtaSummary(
	action: string,
	accounts: LabeledAccount[],
): string {
	if (action === "CreateAssociatedTokenAccount") {
		const owner = findAccount(accounts, "owner");
		const mint = findAccount(accounts, "mint");
		return `Create ATA for ${owner ?? "unknown"} (mint: ${mint ?? "unknown"})`;
	}
	return `Associated Token Program: ${action}`;
}

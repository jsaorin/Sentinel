import { getProgramName } from "./ProgramRegistry.js";

export interface ParsedInstruction {
	action: string;
	params: Record<string, string>;
}

export function parseInstruction(
	programId: string,
	dataBase64: string,
	accounts: string[],
): ParsedInstruction | null {
	const programName = getProgramName(programId);
	if (!programName) return null;

	const buffer = Buffer.from(dataBase64, "base64");

	switch (programName) {
		case "System Program":
			return parseSystemProgram(buffer, accounts);
		case "BPF Upgradeable Loader":
			return parseBpfLoader(buffer, accounts);
		case "Token Program":
		case "Token 2022 Program":
			return parseTokenProgram(buffer);
		case "Compute Budget Program":
			return parseComputeBudget(buffer);
		case "Associated Token Program":
			return { action: "CreateAssociatedTokenAccount", params: {} };
		case "Squads Multisig Program":
			return parseSquadsProgram(buffer);
		default:
			return null;
	}
}

function readU32LE(buffer: Buffer, offset: number): number {
	if (buffer.length < offset + 4) return -1;
	return buffer.readUInt32LE(offset);
}

function readU64LE(buffer: Buffer, offset: number): string {
	if (buffer.length < offset + 8) return "0";
	const lo = buffer.readUInt32LE(offset);
	const hi = buffer.readUInt32LE(offset + 4);
	return (BigInt(hi) * BigInt(0x100000000) + BigInt(lo)).toString();
}

function parseSystemProgram(
	buffer: Buffer,
	accounts: string[],
): ParsedInstruction | null {
	const discriminator = readU32LE(buffer, 0);

	switch (discriminator) {
		case 0: // CreateAccount
			return {
				action: "CreateAccount",
				params: {
					lamports: readU64LE(buffer, 4),
					space: readU64LE(buffer, 12),
					owner: accounts[2] ?? "unknown",
				},
			};
		case 2: // Transfer
			return {
				action: "Transfer",
				params: {
					lamports: readU64LE(buffer, 4),
				},
			};
		case 4: // AdvanceNonceAccount
			return {
				action: "AdvanceNonceAccount",
				params: {},
			};
		case 6: // CreateAccountWithSeed
			return {
				action: "CreateAccountWithSeed",
				params: {
					lamports: readU64LE(buffer, 4),
				},
			};
		case 7: // WithdrawNonceAccount
			return {
				action: "WithdrawNonceAccount",
				params: {
					lamports: readU64LE(buffer, 4),
				},
			};
		case 8: // InitializeNonceAccount
			return {
				action: "InitializeNonceAccount",
				params: {
					authority: accounts[2] ?? "unknown",
				},
			};
		case 9: // AuthorizeNonceAccount
			return {
				action: "AuthorizeNonceAccount",
				params: {
					newAuthority: accounts[1] ?? "unknown",
				},
			};
		case 11: // TransferWithSeed
			return {
				action: "TransferWithSeed",
				params: {
					lamports: readU64LE(buffer, 4),
				},
			};
		default:
			return null;
	}
}

function parseBpfLoader(
	buffer: Buffer,
	accounts: string[],
): ParsedInstruction | null {
	const discriminator = readU32LE(buffer, 0);

	switch (discriminator) {
		case 3: // Upgrade
			return {
				action: "Upgrade",
				params: {
					programData: accounts[0] ?? "unknown",
					program: accounts[1] ?? "unknown",
					bufferAccount: accounts[2] ?? "unknown",
					spillAccount: accounts[3] ?? "unknown",
				},
			};
		case 4: // SetAuthority
			return {
				action: "SetAuthority",
				params: {
					account: accounts[0] ?? "unknown",
					currentAuthority: accounts[1] ?? "unknown",
					newAuthority: accounts[2] ?? "none",
				},
			};
		case 5: // Close
			return {
				action: "Close",
				params: {
					account: accounts[0] ?? "unknown",
					recipient: accounts[1] ?? "unknown",
					authority: accounts[2] ?? "unknown",
				},
			};
		default:
			return null;
	}
}

function parseTokenProgram(buffer: Buffer): ParsedInstruction | null {
	if (buffer.length === 0) return null;
	const discriminator = buffer[0];

	switch (discriminator) {
		case 1: // InitializeAccount
			return {
				action: "InitializeAccount",
				params: {},
			};
		case 3: // Transfer
			return {
				action: "Transfer",
				params: {
					amount: readU64LE(buffer, 1),
				},
			};
		case 4: // Approve
			return {
				action: "Approve",
				params: {
					amount: readU64LE(buffer, 1),
				},
			};
		case 5: // Revoke
			return {
				action: "Revoke",
				params: {},
			};
		case 6: // SetAuthority
			return {
				action: "SetAuthority",
				params: {
					authorityType: readAuthorityType(buffer, 1),
					newAuthority:
						buffer.length > 3 && buffer[2] === 1 ? "present" : "none",
				},
			};
		case 7: // MintTo
			return {
				action: "MintTo",
				params: {
					amount: readU64LE(buffer, 1),
				},
			};
		case 8: // Burn
			return {
				action: "Burn",
				params: {
					amount: readU64LE(buffer, 1),
				},
			};
		case 9: // CloseAccount
			return {
				action: "CloseAccount",
				params: {},
			};
		case 12: // TransferChecked
			return {
				action: "TransferChecked",
				params: {
					amount: readU64LE(buffer, 1),
					decimals: buffer.length > 9 ? buffer[9]!.toString() : "0",
				},
			};
		default:
			return null;
	}
}

function readAuthorityType(buffer: Buffer, offset: number): string {
	if (buffer.length <= offset) return "unknown";
	const value = buffer[offset];
	switch (value) {
		case 0:
			return "MintTokens";
		case 1:
			return "FreezeAccount";
		case 2:
			return "AccountOwner";
		case 3:
			return "CloseAccount";
		default:
			return "unknown";
	}
}

function parseComputeBudget(buffer: Buffer): ParsedInstruction | null {
	if (buffer.length === 0) return null;
	const discriminator = buffer[0];

	switch (discriminator) {
		case 2: // SetComputeUnitLimit
			return {
				action: "SetComputeUnitLimit",
				params: {
					units: readU32LE(buffer, 1).toString(),
				},
			};
		case 3: // SetComputeUnitPrice
			return {
				action: "SetComputeUnitPrice",
				params: {
					microLamports: readU64LE(buffer, 1),
				},
			};
		default:
			return null;
	}
}

function parseSquadsProgram(buffer: Buffer): ParsedInstruction | null {
	// Squads uses 8-byte Anchor discriminators
	if (buffer.length < 8) return null;

	// For now, return a generic action — Anchor discriminators require IDL mapping
	return {
		action: "SquadsInstruction",
		params: {},
	};
}

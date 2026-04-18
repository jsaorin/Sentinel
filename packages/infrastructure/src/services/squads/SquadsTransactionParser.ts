import * as multisig from "@sqds/multisig";

export const SQUADS_V4_PROGRAM_ID = "SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf";

export type SquadsInstructionKind =
	| "proposalCreate"
	| "proposalActivate"
	| "proposalApprove"
	| "proposalReject"
	| "proposalCancel"
	| "vaultTransactionCreate"
	| "vaultTransactionExecute"
	| "vaultTransactionAccountsClose"
	| "configTransactionCreate"
	| "configTransactionExecute"
	| "configTransactionAccountsClose"
	| "batchExecuteTransaction"
	| "batchAccountsClose"
	| "unknown";

const DISCRIMINATORS: Array<{ kind: SquadsInstructionKind; disc: number[] }> = [
	{
		kind: "proposalCreate",
		disc: multisig.generated.proposalCreateInstructionDiscriminator,
	},
	{
		kind: "proposalActivate",
		disc: multisig.generated.proposalActivateInstructionDiscriminator,
	},
	{
		kind: "proposalApprove",
		disc: multisig.generated.proposalApproveInstructionDiscriminator,
	},
	{
		kind: "proposalReject",
		disc: multisig.generated.proposalRejectInstructionDiscriminator,
	},
	{
		kind: "proposalCancel",
		disc: multisig.generated.proposalCancelInstructionDiscriminator,
	},
	{
		kind: "proposalCancel",
		disc: multisig.generated.proposalCancelV2InstructionDiscriminator,
	},
	{
		kind: "vaultTransactionCreate",
		disc: multisig.generated.vaultTransactionCreateInstructionDiscriminator,
	},
	{
		kind: "vaultTransactionExecute",
		disc: multisig.generated.vaultTransactionExecuteInstructionDiscriminator,
	},
	{
		kind: "vaultTransactionAccountsClose",
		disc: multisig.generated.vaultTransactionAccountsCloseInstructionDiscriminator,
	},
	{
		kind: "configTransactionCreate",
		disc: multisig.generated.configTransactionCreateInstructionDiscriminator,
	},
	{
		kind: "configTransactionExecute",
		disc: multisig.generated.configTransactionExecuteInstructionDiscriminator,
	},
	{
		kind: "configTransactionAccountsClose",
		disc: multisig.generated.configTransactionAccountsCloseInstructionDiscriminator,
	},
	{
		kind: "batchExecuteTransaction",
		disc: multisig.generated.batchExecuteTransactionInstructionDiscriminator,
	},
	{
		kind: "batchAccountsClose",
		disc: multisig.generated.batchAccountsCloseInstructionDiscriminator,
	},
];

export function isSquadsInstruction(programId: string): boolean {
	return programId === SQUADS_V4_PROGRAM_ID;
}

export function classifySquadsInstruction(
	data: Buffer,
): SquadsInstructionKind {
	if (data.length < 8) return "unknown";
	const disc = data.subarray(0, 8);
	for (const entry of DISCRIMINATORS) {
		if (discMatches(disc, entry.disc)) return entry.kind;
	}
	return "unknown";
}

function discMatches(actual: Buffer, expected: number[]): boolean {
	if (expected.length !== 8) return false;
	for (let i = 0; i < 8; i++) {
		if (actual[i] !== expected[i]) return false;
	}
	return true;
}

import type { PublicKey } from "@solana/web3.js";

export interface RawInnerInstruction {
	programIdIndex: number;
	accountIndexes: number[];
	data: string; // base64
}

export interface RawAddressTableLookup {
	accountKey: PublicKey;
	writableIndexes: number[];
	readonlyIndexes: number[];
}

export interface DecodedVaultTransactionCreate {
	vaultIndex: number;
	ephemeralSigners: number;
	accountKeys: PublicKey[];
	addressTableLookups: RawAddressTableLookup[];
	instructions: RawInnerInstruction[];
}

export function decodeVaultTransactionCreate(
	data: Buffer,
): DecodedVaultTransactionCreate | null {
	try {
		const [parsed] =
			multisig.generated.vaultTransactionCreateStruct.deserialize(data);
		const msgBytes = Buffer.from(parsed.args.transactionMessage);
		// CRITICAL: use `types.transactionMessageBeet` (input format, u8
		// SmallVec length prefixes), NOT `generated.vaultTransactionMessageBeet`
		// (account-storage format with u32 Vec prefixes). Feeding the input
		// bytes into the account-format beet reads the first pubkey bytes as a
		// giant u32 length and OOMs V8 trying to allocate a sparse array.
		const [msg] = multisig.types.transactionMessageBeet.deserialize(msgBytes);
		return {
			vaultIndex: parsed.args.vaultIndex,
			ephemeralSigners: parsed.args.ephemeralSigners,
			accountKeys: msg.accountKeys,
			addressTableLookups: msg.addressTableLookups.map((lookup) => ({
				accountKey: lookup.accountKey,
				writableIndexes: Array.from(lookup.writableIndexes),
				readonlyIndexes: Array.from(lookup.readonlyIndexes),
			})),
			instructions: msg.instructions.map((ix) => ({
				programIdIndex: ix.programIdIndex,
				accountIndexes: Array.from(ix.accountIndexes),
				data: Buffer.from(ix.data).toString("base64"),
			})),
		};
	} catch {
		return null;
	}
}

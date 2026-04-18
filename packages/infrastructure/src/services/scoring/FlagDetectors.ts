import type { DecodedInstruction } from "@sentinel/domain";
import { FlagSeverity, FlagType, type ProposalFlag } from "@sentinel/domain";

const LAMPORTS_PER_SOL = 1_000_000_000n;
const LARGE_TRANSFER_THRESHOLD_LAMPORTS = 100n * LAMPORTS_PER_SOL;
const MULTI_INSTRUCTION_THRESHOLD = 3;

export interface FlagDetectionContext {
	decodedInstructions: DecodedInstruction[];
	historicalActions: Set<string>;
}

export function detectFlags(context: FlagDetectionContext): ProposalFlag[] {
	const flags: ProposalFlag[] = [];

	const durableNonce = detectDurableNonce(context.decodedInstructions);
	if (durableNonce) flags.push(durableNonce);

	const authorityTransfer = detectAuthorityTransfer(
		context.decodedInstructions,
	);
	if (authorityTransfer) flags.push(authorityTransfer);

	const upgradeProgram = detectUpgradeProgram(context.decodedInstructions);
	if (upgradeProgram) flags.push(upgradeProgram);

	const largeTransfer = detectLargeTransfer(context.decodedInstructions);
	if (largeTransfer) flags.push(largeTransfer);

	const unknownProgram = detectUnknownProgram(context.decodedInstructions);
	if (unknownProgram) flags.push(unknownProgram);

	const multiInstruction = detectMultiInstruction(context.decodedInstructions);
	if (multiInstruction) flags.push(multiInstruction);

	const firstTimeAction = detectFirstTimeAction(
		context.decodedInstructions,
		context.historicalActions,
	);
	if (firstTimeAction) flags.push(firstTimeAction);

	return flags;
}

function detectDurableNonce(
	instructions: DecodedInstruction[],
): ProposalFlag | null {
	const match = instructions.find(
		(ix) =>
			ix.programName === "System Program" &&
			ix.action === "AdvanceNonceAccount",
	);
	if (!match) return null;
	return {
		type: FlagType.DURABLE_NONCE,
		severity: FlagSeverity.HIGH,
		points: 30,
		detail:
			"Durable nonce used (AdvanceNonceAccount). The transaction can be executed outside the usual time window",
	};
}

function detectAuthorityTransfer(
	instructions: DecodedInstruction[],
): ProposalFlag | null {
	const match = instructions.find(
		(ix) =>
			ix.programName === "BPF Upgradeable Loader" &&
			ix.action === "SetAuthority",
	);
	if (!match) return null;
	return {
		type: FlagType.AUTHORITY_TRANSFER,
		severity: FlagSeverity.CRITICAL,
		points: 40,
		detail:
			"Program authority transfer (SetAuthority on BPF Upgradeable Loader)",
	};
}

function detectUpgradeProgram(
	instructions: DecodedInstruction[],
): ProposalFlag | null {
	const match = instructions.find(
		(ix) =>
			ix.programName === "BPF Upgradeable Loader" && ix.action === "Upgrade",
	);
	if (!match) return null;
	return {
		type: FlagType.UPGRADE_PROGRAM,
		severity: FlagSeverity.CRITICAL,
		points: 35,
		detail: "Program upgrade (BPF Upgradeable Loader)",
	};
}

function detectLargeTransfer(
	instructions: DecodedInstruction[],
): ProposalFlag | null {
	let totalLamports = 0n;
	let transferCount = 0;

	for (const ix of instructions) {
		if (ix.programName !== "System Program" || ix.action !== "Transfer") {
			continue;
		}
		const raw = ix.params.lamports;
		if (!raw) continue;
		try {
			totalLamports += BigInt(raw);
			transferCount += 1;
		} catch {
			// Ignorar si el valor no es parseable como BigInt
		}
	}

	if (transferCount === 0) return null;
	if (totalLamports <= LARGE_TRANSFER_THRESHOLD_LAMPORTS) return null;

	const sol = Number(totalLamports / LAMPORTS_PER_SOL);
	return {
		type: FlagType.LARGE_TRANSFER,
		severity: FlagSeverity.MEDIUM,
		points: 15,
		detail: `Large transfer detected (~${sol} SOL across ${transferCount} instruction(s))`,
	};
}

function detectUnknownProgram(
	instructions: DecodedInstruction[],
): ProposalFlag | null {
	const match = instructions.find((ix) => !ix.isKnown);
	if (!match) return null;
	return {
		type: FlagType.UNKNOWN_PROGRAM,
		severity: FlagSeverity.MEDIUM,
		points: 10,
		detail:
			"The proposal contains instructions to a program unknown to Sentinel",
	};
}

function detectMultiInstruction(
	instructions: DecodedInstruction[],
): ProposalFlag | null {
	if (instructions.length <= MULTI_INSTRUCTION_THRESHOLD) return null;
	return {
		type: FlagType.MULTI_INSTRUCTION,
		severity: FlagSeverity.LOW,
		points: 5,
		detail: `The proposal contains ${instructions.length} instructions`,
	};
}

function detectFirstTimeAction(
	instructions: DecodedInstruction[],
	historicalActions: Set<string>,
): ProposalFlag | null {
	const novelActions: string[] = [];
	for (const ix of instructions) {
		if (!ix.isKnown) continue;
		const key = `${ix.programName}::${ix.action}`;
		if (!historicalActions.has(key)) {
			novelActions.push(key);
		}
	}
	if (novelActions.length === 0) return null;
	return {
		type: FlagType.FIRST_TIME_ACTION,
		severity: FlagSeverity.HIGH,
		points: 20,
		detail: `First time this multisig executes: ${novelActions.join(", ")}`,
	};
}

export function buildActionKey(programName: string, action: string): string {
	return `${programName}::${action}`;
}

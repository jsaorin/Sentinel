import type { DecodedInstruction } from "@sentinel/domain";
import { FlagType, type ProposalFlag } from "@sentinel/domain";

const FLAG_LABELS: Record<FlagType, string> = {
	[FlagType.DURABLE_NONCE]: "durable nonce",
	[FlagType.AUTHORITY_TRANSFER]: "authority transfer",
	[FlagType.UPGRADE_PROGRAM]: "program upgrade",
	[FlagType.LARGE_TRANSFER]: "large transfer",
	[FlagType.UNKNOWN_PROGRAM]: "unknown program",
	[FlagType.MULTI_INSTRUCTION]: "multi-instruction",
	[FlagType.FIRST_TIME_ACTION]: "first-time action",
};

export function generateProposalSummary(
	decodedInstructions: DecodedInstruction[],
	flags: ProposalFlag[],
): string {
	const count = decodedInstructions.length;

	if (count === 0) {
		return "Proposal has no decoded instructions";
	}

	if (flags.length === 0) {
		const first = decodedInstructions[0];
		const rest = count > 1 ? ` (+${count - 1} more)` : "";
		return `${first.programName}: ${first.action}${rest}`;
	}

	const flagLabels = flags.map((flag) => FLAG_LABELS[flag.type]);
	return `${count} instruction(s) — flags: ${flagLabels.join(", ")}`;
}

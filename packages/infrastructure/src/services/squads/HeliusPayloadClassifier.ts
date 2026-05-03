import type {
	ClassifiedHeliusEvent,
	HeliusEventKind,
	IHeliusPayloadClassifier,
} from "@sentinel/domain";
import bs58 from "bs58";
import { injectable } from "inversify";
import {
	SQUADS_V4_PROGRAM_ID,
	type SquadsInstructionKind,
	classifySquadsInstruction,
} from "./SquadsTransactionParser.js";

interface RawIx {
	programId?: unknown;
	data?: unknown;
	accounts?: unknown;
	innerInstructions?: unknown;
}

const PROPOSAL_ACCOUNT_INDEX_BY_KIND: Partial<
	Record<SquadsInstructionKind, number>
> = {
	proposalCreate: 1,
	proposalActivate: 2,
	proposalApprove: 2,
	proposalReject: 2,
	proposalCancel: 2,
};

@injectable()
export class HeliusPayloadClassifier implements IHeliusPayloadClassifier {
	classify(payload: unknown): ClassifiedHeliusEvent | null {
		const instructions = this.extractInstructions(payload);
		if (instructions.length === 0) return null;

		let firstSquadsHit: {
			kind: SquadsInstructionKind;
			accounts: string[];
		} | null = null;
		let configChangeSeen = false;

		for (const ix of instructions) {
			const programId = typeof ix.programId === "string" ? ix.programId : null;
			if (!programId || programId !== SQUADS_V4_PROGRAM_ID) continue;

			const data = this.decodeData(ix.data);
			if (!data) continue;

			const kind = classifySquadsInstruction(data);
			if (kind === "unknown") continue;

			const accounts = Array.isArray(ix.accounts)
				? ix.accounts.filter((a): a is string => typeof a === "string")
				: [];
			if (accounts.length === 0) continue;

			if (!firstSquadsHit) firstSquadsHit = { kind, accounts };
			if (kind === "configTransactionExecute") configChangeSeen = true;
		}

		if (!firstSquadsHit) return null;

		const multisigAddress = firstSquadsHit.accounts[0];
		const proposalIdx = PROPOSAL_ACCOUNT_INDEX_BY_KIND[firstSquadsHit.kind];
		const proposalPda =
			proposalIdx !== undefined && firstSquadsHit.accounts[proposalIdx]
				? firstSquadsHit.accounts[proposalIdx]
				: undefined;

		const finalKind: HeliusEventKind = configChangeSeen
			? "config-change"
			: "proposal-action";

		return { multisigAddress, kind: finalKind, proposalPda };
	}

	private extractInstructions(payload: unknown): RawIx[] {
		if (!payload || typeof payload !== "object") return [];
		const root = payload as { instructions?: unknown };
		const top = Array.isArray(root.instructions)
			? (root.instructions as RawIx[])
			: [];

		const inner: RawIx[] = [];
		for (const ix of top) {
			if (!ix || typeof ix !== "object") continue;
			const nested = (ix as RawIx).innerInstructions;
			if (Array.isArray(nested)) {
				for (const sub of nested) {
					if (sub && typeof sub === "object") inner.push(sub as RawIx);
				}
			}
		}

		return [...top, ...inner];
	}

	private decodeData(raw: unknown): Buffer | null {
		if (typeof raw !== "string" || raw.length === 0) return null;
		try {
			return Buffer.from(bs58.decode(raw));
		} catch {
			try {
				return Buffer.from(raw, "base64");
			} catch {
				return null;
			}
		}
	}
}

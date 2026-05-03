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
		const root = payload as Record<string, unknown>;

		if (Array.isArray(root.instructions)) {
			return this.extractFromEnhanced(root.instructions as RawIx[]);
		}
		if (
			root.transaction &&
			typeof root.transaction === "object" &&
			(root.transaction as { message?: unknown }).message
		) {
			return this.extractFromRaw(root);
		}
		return [];
	}

	private extractFromEnhanced(top: RawIx[]): RawIx[] {
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

	private extractFromRaw(root: Record<string, unknown>): RawIx[] {
		const message = (root.transaction as { message?: unknown }).message as
			| { accountKeys?: unknown; instructions?: unknown }
			| undefined;
		if (!message) return [];
		const keys = Array.isArray(message.accountKeys)
			? (message.accountKeys as unknown[]).filter(
					(k): k is string => typeof k === "string",
				)
			: [];
		const topRaw = Array.isArray(message.instructions)
			? (message.instructions as Array<{
					programIdIndex?: number;
					accounts?: number[];
					data?: string;
				}>)
			: [];

		const top: RawIx[] = topRaw.map((ix) => ({
			programId:
				typeof ix.programIdIndex === "number"
					? keys[ix.programIdIndex]
					: undefined,
			accounts: Array.isArray(ix.accounts)
				? ix.accounts
						.map((idx) => (typeof idx === "number" ? keys[idx] : undefined))
						.filter((s): s is string => typeof s === "string")
				: [],
			data: typeof ix.data === "string" ? ix.data : undefined,
		}));

		const inner: RawIx[] = [];
		const meta = root.meta as
			| {
					innerInstructions?: Array<{ instructions?: unknown }>;
			  }
			| undefined;
		if (meta && Array.isArray(meta.innerInstructions)) {
			for (const innerSet of meta.innerInstructions) {
				if (!innerSet || !Array.isArray(innerSet.instructions)) continue;
				for (const sub of innerSet.instructions as Array<{
					programIdIndex?: number;
					accounts?: number[];
					data?: string;
				}>) {
					inner.push({
						programId:
							typeof sub.programIdIndex === "number"
								? keys[sub.programIdIndex]
								: undefined,
						accounts: Array.isArray(sub.accounts)
							? sub.accounts
									.map((idx) =>
										typeof idx === "number" ? keys[idx] : undefined,
									)
									.filter((s): s is string => typeof s === "string")
							: [],
						data: typeof sub.data === "string" ? sub.data : undefined,
					});
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

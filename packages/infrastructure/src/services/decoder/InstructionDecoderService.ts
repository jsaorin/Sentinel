import type { ILogger } from "@sentinel/common/logger";
import {
	DOMAIN_TYPES,
	type DecodedInstructionData,
	type IIdlResolverService,
	type IInstructionDecoderService,
	type ProposalInstruction,
} from "@sentinel/domain";
import { inject, injectable } from "inversify";
import { labelAccounts } from "./AccountLabeler.js";
import { AnchorProgramParser } from "./AnchorProgramParser.js";
import { parseInstruction } from "./InstructionParser.js";
import { getProgramName } from "./ProgramRegistry.js";
import { generateSummary } from "./SummaryGenerator.js";

@injectable()
export class InstructionDecoderService implements IInstructionDecoderService {
	constructor(
		@inject(DOMAIN_TYPES.IdlResolverService)
		private idlResolver: IIdlResolverService,
		@inject(DOMAIN_TYPES.Logger)
		private logger: ILogger,
	) {}

	async decode(
		instructions: ProposalInstruction[],
	): Promise<DecodedInstructionData[]> {
		return Promise.all(instructions.map((ix) => this.decodeOne(ix)));
	}

	private async decodeOne(
		ix: ProposalInstruction,
	): Promise<DecodedInstructionData> {
		// ─── Layer 1 — native hardcoded parsers ───
		const nativeName = getProgramName(ix.programId);
		if (nativeName) {
			const parsed = parseInstruction(ix.programId, ix.data, ix.accounts);
			if (parsed) {
				const accounts = labelAccounts(nativeName, parsed.action, ix.accounts);
				const summary = generateSummary(
					nativeName,
					parsed.action,
					parsed.params,
					accounts,
				);
				return {
					proposalInstructionId: ix.id,
					programName: nativeName,
					action: parsed.action,
					params: parsed.params,
					accounts,
					summary,
					isKnown: true,
				};
			}
		}

		// ─── Layer 2 — IDL-driven decoding ───
		const resolved = await this.idlResolver.resolve(ix.programId);
		if (resolved) {
			try {
				const parser = new AnchorProgramParser(resolved.raw);
				const parsed = parser.parse(ix.data);
				if (parsed) {
					const accounts = ix.accounts.map((addr, i) => ({
						address: addr,
						label: parsed.accountLabels[i] ?? `account_${i}`,
					}));
					const label = resolved.name
						? capitalize(resolved.name)
						: "Anchor Program";
					return {
						proposalInstructionId: ix.id,
						programName: label,
						action: parsed.action,
						params: parsed.args,
						accounts,
						summary: `${label}: ${parsed.action}`,
						isKnown: true,
					};
				}
			} catch (e) {
				this.logger.warning("Anchor parse failed", {
					programId: ix.programId,
					error: e instanceof Error ? e.message : String(e),
				});
			}
		}

		// ─── Fallback — unknown ───
		const fallbackName =
			(resolved?.name && capitalize(resolved.name)) ||
			nativeName ||
			"Unknown Program";
		const disc = this.discriminatorHex(ix.data);
		return {
			proposalInstructionId: ix.id,
			programName: fallbackName,
			action: "Unknown",
			params: disc ? { discriminator: disc } : {},
			accounts: ix.accounts.map((a, i) => ({
				address: a,
				label: `account_${i}`,
			})),
			summary: this.buildUnknownSummary(fallbackName, disc, Boolean(resolved)),
			isKnown: false,
		};
	}

	private discriminatorHex(dataBase64: string): string | null {
		try {
			const buf = Buffer.from(dataBase64, "base64");
			if (buf.length < 8) return null;
			return buf.subarray(0, 8).toString("hex");
		} catch {
			return null;
		}
	}

	private buildUnknownSummary(
		programName: string,
		disc: string | null,
		programIsPublishedOnChain: boolean,
	): string {
		if (programIsPublishedOnChain) {
			// Program publishes an IDL on-chain, but this specific instruction's
			// discriminator is NOT in it. This is a strong risk signal: reputable
			// protocols should declare every active handler in their on-chain IDL.
			// Common causes: (1) bytecode was upgraded without refreshing the IDL,
			// (2) deprecated handler still live in bytecode, (3) undeclared admin
			// backdoor.
			const discSuffix = disc ? ` (discriminator ${disc})` : "";
			return `WARNING: Unknown instruction on ${programName}${discSuffix}. The program publishes an on-chain IDL, but this instruction's discriminator is not declared in it. Reputable protocols should keep their on-chain IDL in sync with deployed bytecode — an undeclared handler may indicate deprecated code, undisclosed administrative functionality, or recent bytecode changes not yet reflected in the declared interface. Treat with high suspicion.`;
		}
		return `Unknown instruction on ${programName}. No on-chain IDL is available for this program, so the instruction shape cannot be decoded. Verify the program identity and intent manually before signing.`;
	}
}

function capitalize(s: string): string {
	if (!s) return s;
	return s.charAt(0).toUpperCase() + s.slice(1);
}

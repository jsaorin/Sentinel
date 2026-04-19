import { createHash } from "node:crypto";
import { BorshCoder, type Idl } from "@coral-xyz/anchor";

export interface AnchorParseResult {
	action: string;
	args: Record<string, string>;
	accountLabels: string[];
}

interface IdlInstruction {
	name: string;
	accounts: Array<{ name: string }>;
	args: Array<{ name: string; type: unknown }>;
	discriminator?: number[];
}

export class AnchorProgramParser {
	private readonly coder: BorshCoder;
	private readonly idl: Idl;
	private readonly instructions: IdlInstruction[];
	private readonly discLookup: Map<string, IdlInstruction>;

	constructor(idl: unknown) {
		this.idl = idl as Idl;
		this.coder = new BorshCoder(this.idl);
		this.instructions = ((idl as { instructions?: IdlInstruction[] })
			.instructions ?? []) as IdlInstruction[];
		this.discLookup = new Map();
		for (const ix of this.instructions) {
			if (ix.discriminator?.length === 8) {
				this.discLookup.set(Buffer.from(ix.discriminator).toString("hex"), ix);
			}
			const camelDisc = anchorDiscriminator(ix.name);
			const snakeDisc = anchorDiscriminator(toSnakeCase(ix.name));
			this.discLookup.set(camelDisc, ix);
			if (snakeDisc !== camelDisc) this.discLookup.set(snakeDisc, ix);
		}
	}

	parse(dataBase64: string): AnchorParseResult | null {
		const buf = Buffer.from(dataBase64, "base64");
		if (buf.length < 8) return null;

		// Primary path: BorshCoder (handles camel↔snake mapping and full arg decode).
		try {
			const decoded = this.coder.instruction.decode(buf);
			if (decoded) {
				return {
					action: decoded.name,
					args: normalizeArgs(decoded.data) as Record<string, string>,
					accountLabels: this.labelsFor(decoded.name),
				};
			}
		} catch {
			// fall through to disc-only fallback
		}

		// Fallback: manual discriminator lookup (snake_case + camelCase + explicit).
		// If BorshCoder failed but we recognize the discriminator, we still return
		// the action name + account labels; args are empty (layout mismatch).
		const disc = buf.subarray(0, 8).toString("hex");
		const ix = this.discLookup.get(disc);
		if (!ix) return null;
		return {
			action: ix.name,
			args: {},
			accountLabels: ix.accounts.map((a) => a.name),
		};
	}

	private labelsFor(action: string): string[] {
		const ix = this.instructions.find((i) => i.name === action);
		return ix?.accounts.map((a) => a.name) ?? [];
	}
}

function anchorDiscriminator(name: string): string {
	return createHash("sha256")
		.update(`global:${name}`)
		.digest()
		.subarray(0, 8)
		.toString("hex");
}

function toSnakeCase(camel: string): string {
	return camel.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

/**
 * Recursively normalize Borsh-decoded args into a string-only record so it
 * fits `DecodedInstructionData.params: Record<string, string>`.
 *
 * - BN           → .toString() (base 10)
 * - PublicKey    → .toBase58()
 * - Buffer       → hex
 * - Uint8Array   → hex
 * - Anchor enum  → ({ variantName: {} }) → "variantName" (or with data: JSON)
 * - bigint       → .toString()
 * - boolean      → "true" | "false"
 * - number       → String(n)
 * - struct/array → JSON-encoded string with the same normalizer applied recursively
 */
function normalizeArgs(data: unknown): unknown {
	if (!isPlainObject(data)) return normalizeValue(data);
	const out: Record<string, string> = {};
	for (const [key, val] of Object.entries(data)) {
		out[key] = toDisplayString(val);
	}
	return out;
}

function toDisplayString(val: unknown): string {
	const normalized = normalizeValue(val);
	if (typeof normalized === "string") return normalized;
	if (typeof normalized === "number" || typeof normalized === "boolean")
		return String(normalized);
	return JSON.stringify(normalized);
}

function normalizeValue(val: unknown): unknown {
	if (val === null || val === undefined) return "";
	if (typeof val === "string") return val;
	if (typeof val === "number") return val;
	if (typeof val === "boolean") return val;
	if (typeof val === "bigint") return val.toString();

	// BN (BigNumber) — has toString and _bn-style markers
	if (
		typeof val === "object" &&
		typeof (val as { toString?: unknown }).toString === "function"
	) {
		const proto = Object.getPrototypeOf(val)?.constructor?.name;
		if (proto === "BN") return (val as { toString(): string }).toString();
		if (proto === "PublicKey")
			return (val as { toBase58(): string }).toBase58();
	}

	// Node Buffer
	if (Buffer.isBuffer(val)) return val.toString("hex");
	// Typed arrays (Uint8Array etc.)
	if (val instanceof Uint8Array) return Buffer.from(val).toString("hex");

	if (Array.isArray(val)) return val.map((v) => normalizeValue(v));

	// Anchor enum encoding: { variantName: {} } — single-key object with empty or object value.
	if (isPlainObject(val)) {
		const keys = Object.keys(val);
		if (keys.length === 1) {
			const k = keys[0]!;
			const inner = (val as Record<string, unknown>)[k];
			if (
				inner &&
				typeof inner === "object" &&
				Object.keys(inner).length === 0
			) {
				return k;
			}
		}
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(val)) out[k] = normalizeValue(v);
		return out;
	}

	return String(val);
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
	if (val === null || typeof val !== "object") return false;
	const proto = Object.getPrototypeOf(val);
	return proto === Object.prototype || proto === null;
}

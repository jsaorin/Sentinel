import {
	DOMAIN_TYPES,
	type IAIAnalysisService,
	type MultisigAISummary,
	type MultisigAnalysisContext,
	type ProposalAIAnalysis,
	type ProposalAnalysisContext,
	type Recommendation,
	type ThreatAnalysisInput,
	type ThreatAnalysisResult,
} from "@sentinel/domain";
import type { ILogger } from "@sentinel/common/logger";
import { PublicKey } from "@solana/web3.js";
import { inject, injectable } from "inversify";
import { z } from "zod";
import {
	MULTISIG_SUMMARY_SYSTEM_PROMPT,
	buildMultisigSummaryUserPrompt,
} from "./prompts/multisigSummary.prompt.js";
import {
	PROPOSAL_ANALYSIS_SYSTEM_PROMPT,
	buildProposalAnalysisUserPrompt,
} from "./prompts/proposalAnalysis.prompt.js";
import {
	THREAT_ANALYSIS_SYSTEM_PROMPT,
	buildThreatAnalysisUserPrompt,
} from "./prompts/threatAnalysis.prompt.js";

export interface GroqApiConfig {
	apiKey: string;
	model: string;
	dryRun?: boolean;
}

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const VALID_RECOMMENDATIONS: ReadonlySet<Recommendation> = new Set([
	"SIGN",
	"VERIFY",
	"DO_NOT_SIGN",
]);

const DRY_RUN_MULTISIG_SUMMARY: MultisigAISummary = {
	aiSummary:
		"[DRY RUN] Groq AI disabled. Static multisig summary returned for local development.",
};

const DRY_RUN_PROPOSAL_ANALYSIS: ProposalAIAnalysis = {
	aiAnalysis:
		"[DRY RUN] Groq AI disabled. Static proposal analysis returned for local development.",
	recommendation: "VERIFY",
};

const DRY_RUN_THREAT_ANALYSIS: ThreatAnalysisResult = {
	isThreat: false,
	severity: null,
	category: null,
	summary:
		"[DRY RUN] Groq AI disabled. Static threat analysis returned for local development.",
	entities: [],
	rawAnalysisJson: { dryRun: true },
};

const threatAnalysisSchema = z.object({
	isThreat: z.boolean(),
	severity: z.enum(["low", "medium", "high"]).nullable().optional(),
	category: z
		.enum(["phishing", "rugpull", "exploit", "compromised_key", "other"])
		.nullable()
		.optional(),
	summary: z.string().nullable().optional(),
	entities: z
		.array(
			z.object({
				kind: z.enum(["program", "multisig", "wallet"]),
				role: z
					.enum(["attacker", "victim", "compromised", "vulnerable", "unknown"])
					.nullable()
					.optional(),
				address: z.string().nullable().optional(),
				contextSnippet: z.string().nullable().optional(),
			}),
		)
		.default([]),
});

@injectable()
export class GroqAIAnalysisService implements IAIAnalysisService {
	constructor(
		@inject(DOMAIN_TYPES.GroqApiConfig)
		private config: GroqApiConfig,
		@inject(DOMAIN_TYPES.Logger)
		private logger: ILogger,
	) {}

	async summarizeMultisig(
		context: MultisigAnalysisContext,
	): Promise<MultisigAISummary> {
		if (this.config.dryRun) {
			this.logger.info("groq:dry-run", { operation: "summarizeMultisig" });
			return DRY_RUN_MULTISIG_SUMMARY;
		}

		const raw = await this.callChatCompletion({
			systemPrompt: MULTISIG_SUMMARY_SYSTEM_PROMPT,
			userPrompt: buildMultisigSummaryUserPrompt(context),
		});

		const parsed = this.parseJson(raw);
		const aiSummary = this.requireString(parsed, "aiSummary");
		return { aiSummary };
	}

	async analyzeProposal(
		context: ProposalAnalysisContext,
	): Promise<ProposalAIAnalysis> {
		if (this.config.dryRun) {
			this.logger.info("groq:dry-run", { operation: "analyzeProposal" });
			return DRY_RUN_PROPOSAL_ANALYSIS;
		}

		const raw = await this.callChatCompletion({
			systemPrompt: PROPOSAL_ANALYSIS_SYSTEM_PROMPT,
			userPrompt: buildProposalAnalysisUserPrompt(context),
		});

		const parsed = this.parseJson(raw);
		const aiAnalysis = this.requireString(parsed, "aiAnalysis");
		const recommendation = this.requireRecommendation(parsed);
		return { aiAnalysis, recommendation };
	}

	async analyzeThreatSignal(
		input: ThreatAnalysisInput,
	): Promise<ThreatAnalysisResult> {
		if (this.config.dryRun) {
			this.logger.info("groq:dry-run", { operation: "analyzeThreatSignal" });
			return DRY_RUN_THREAT_ANALYSIS;
		}

		const raw = await this.callChatCompletion({
			systemPrompt: THREAT_ANALYSIS_SYSTEM_PROMPT,
			userPrompt: buildThreatAnalysisUserPrompt(input),
			maxTokens: 800,
		});

		const parsed = this.parseJson(raw);
		const validation = threatAnalysisSchema.safeParse(parsed);

		if (!validation.success) {
			this.logger.error("threat-analysis:schema-invalid", {
				issues: validation.error.issues,
				raw: raw.slice(0, 500),
			});
			return {
				isThreat: false,
				severity: null,
				category: null,
				summary: null,
				entities: [],
				rawAnalysisJson: parsed,
			};
		}

		const data = validation.data;
		const filteredEntities: ThreatAnalysisResult["entities"] = [];
		const rejected: Array<{ address: string | null; reason: string }> = [];

		for (const entity of data.entities) {
			const address = entity.address?.trim();
			if (!address) {
				rejected.push({ address: entity.address ?? null, reason: "missing-address" });
				continue;
			}
			const rejection = this.rejectNonSolanaAddress(address);
			if (rejection) {
				rejected.push({ address, reason: rejection });
				continue;
			}
			filteredEntities.push({
				kind: entity.kind,
				role: entity.role ?? null,
				address,
				contextSnippet: entity.contextSnippet ?? null,
			});
		}

		if (rejected.length > 0) {
			this.logger.info("threat-analysis:entities-filtered", { rejected });
		}

		return {
			isThreat: data.isThreat,
			severity: data.isThreat ? (data.severity ?? null) : null,
			category: data.isThreat ? (data.category ?? null) : null,
			summary: data.summary ?? null,
			entities: filteredEntities,
			rawAnalysisJson: parsed,
		};
	}

	private rejectNonSolanaAddress(address: string): string | null {
		if (address.startsWith("0x")) return "evm";
		if (
			address.startsWith("bc1") ||
			/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)
		)
			return "bitcoin";
		if (address.length === 34 && address.startsWith("T")) return "tron";
		if (address.length <= 35 && address.startsWith("r")) return "ripple";

		try {
			const pk = new PublicKey(address);
			if (pk.toBase58() !== address) return "normalization-mismatch";
			return null;
		} catch {
			return "invalid-solana-pubkey";
		}
	}

	private async callChatCompletion(args: {
		systemPrompt: string;
		userPrompt: string;
		maxTokens?: number;
	}): Promise<string> {
		const body = {
			model: this.config.model,
			messages: [
				{ role: "system", content: args.systemPrompt },
				{ role: "user", content: args.userPrompt },
			],
			response_format: { type: "json_object" },
			temperature: 0.2,
			max_tokens: args.maxTokens ?? 400,
		};

		const response = await fetch(GROQ_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.config.apiKey}`,
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorBody = await response.text();
			throw new Error(
				`Groq request failed: ${response.status} ${response.statusText} ${errorBody}`,
			);
		}

		const json = (await response.json()) as {
			choices?: Array<{ message?: { content?: string } }>;
		};

		const content = json.choices?.[0]?.message?.content;
		if (!content) {
			throw new Error("Groq response missing message content");
		}
		return content;
	}

	private parseJson(raw: string): Record<string, unknown> {
		try {
			const parsed = JSON.parse(raw);
			if (typeof parsed !== "object" || parsed === null) {
				throw new Error("Groq response is not a JSON object");
			}
			return parsed as Record<string, unknown>;
		} catch (error) {
			this.logger.error("groq:invalid-json", {
				raw: raw.slice(0, 500),
				error: error instanceof Error ? error.message : String(error),
			});
			throw new Error("Groq response is not valid JSON");
		}
	}

	private requireString(
		parsed: Record<string, unknown>,
		field: string,
	): string {
		const value = parsed[field];
		if (typeof value !== "string" || value.trim().length === 0) {
			throw new Error(`Groq response missing or empty field: ${field}`);
		}
		return value.trim();
	}

	private requireRecommendation(
		parsed: Record<string, unknown>,
	): Recommendation {
		const value = parsed.recommendation;
		if (typeof value !== "string") {
			throw new Error("Groq response missing recommendation");
		}
		const normalized = value.trim().toUpperCase() as Recommendation;
		if (!VALID_RECOMMENDATIONS.has(normalized)) {
			throw new Error(`Groq returned invalid recommendation: ${value}`);
		}
		return normalized;
	}
}

import {
	DOMAIN_TYPES,
	type IAIAnalysisService,
	type MultisigAISummary,
	type MultisigAnalysisContext,
	type ProposalAIAnalysis,
	type ProposalAnalysisContext,
	type Recommendation,
} from "@sentinel/domain";
import type { ILogger } from "@sentinel/common/logger";
import { inject, injectable } from "inversify";
import {
	MULTISIG_SUMMARY_SYSTEM_PROMPT,
	buildMultisigSummaryUserPrompt,
} from "./prompts/multisigSummary.prompt.js";
import {
	PROPOSAL_ANALYSIS_SYSTEM_PROMPT,
	buildProposalAnalysisUserPrompt,
} from "./prompts/proposalAnalysis.prompt.js";

export interface GroqApiConfig {
	apiKey: string;
	model: string;
}

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const VALID_RECOMMENDATIONS: ReadonlySet<Recommendation> = new Set([
	"SIGN",
	"VERIFY",
	"DO_NOT_SIGN",
]);

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
		const raw = await this.callChatCompletion({
			systemPrompt: PROPOSAL_ANALYSIS_SYSTEM_PROMPT,
			userPrompt: buildProposalAnalysisUserPrompt(context),
		});

		const parsed = this.parseJson(raw);
		const aiAnalysis = this.requireString(parsed, "aiAnalysis");
		const recommendation = this.requireRecommendation(parsed);
		return { aiAnalysis, recommendation };
	}

	private async callChatCompletion(args: {
		systemPrompt: string;
		userPrompt: string;
	}): Promise<string> {
		const body = {
			model: this.config.model,
			messages: [
				{ role: "system", content: args.systemPrompt },
				{ role: "user", content: args.userPrompt },
			],
			response_format: { type: "json_object" },
			temperature: 0.2,
			max_tokens: 400,
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

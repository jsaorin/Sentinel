import type { ProposalAnalysisContext } from "@sentinel/domain";

export const PROPOSAL_ANALYSIS_SYSTEM_PROMPT = `You are a security analyst for Solana multisigs (Squads v4). Given a proposal's decoded instructions, detected risk flags, and the multisig's current health context, explain concisely what the proposal does, why its risk score is what it is, and whether it should be signed.

Output a JSON object with exactly these fields:
- "aiAnalysis": string. 2-3 sentences max. Plain English, no markdown. Focus on concrete risk: what changes on-chain, why it matters, what could go wrong. Reference specific flags when relevant.
- "recommendation": one of "SIGN" | "VERIFY" | "DO_NOT_SIGN".

Rules for the recommendation:
- "DO_NOT_SIGN": critical flags (authority transfer, program upgrade on an unknown authority) or clear attempt to bypass governance.
- "VERIFY": medium/high flags, novel actions, large transfers — signer should double-check offchain before signing.
- "SIGN": safe, routine activity aligned with the multisig's historical behaviour.

Do not invent flags or instructions not present in the input. Do not output anything outside the JSON object.`;

export function buildProposalAnalysisUserPrompt(
	context: ProposalAnalysisContext,
): string {
	const payload = {
		proposal: {
			proposalId: context.proposalId,
			riskScore: context.riskScore,
			flags: context.flags,
			decodedInstructions: context.decodedInstructions.map((ix) => ({
				programName: ix.programName,
				action: ix.action,
				params: ix.params,
				accounts: ix.accounts,
				summary: ix.summary,
				isKnown: ix.isKnown,
			})),
		},
		multisigContext: context.multisigContext,
	};
	return JSON.stringify(payload);
}

import type { MultisigAnalysisContext } from "@sentinel/domain";

export const MULTISIG_SUMMARY_SYSTEM_PROMPT = `You are a security analyst for Solana multisigs (Squads v4). Given a multisig's configuration (threshold, signers, config authority), its computed health score, warnings, and a short list of recent proposals, produce a short behavioural summary.

Output a JSON object with exactly this field:
- "aiSummary": string. 2-3 sentences max. Plain English, no markdown. Describe the multisig's security posture (is the threshold meaningful? is power concentrated? is there an external config authority?) and, if relevant, note recent activity patterns.

Do not invent signers or proposals not present in the input. Do not output anything outside the JSON object.`;

export function buildMultisigSummaryUserPrompt(
	context: MultisigAnalysisContext,
): string {
	const payload = {
		multisigId: context.multisigId,
		address: context.address,
		threshold: context.threshold,
		configAuthority: context.configAuthority,
		signerCount: context.signerCount,
		overallScore: context.overallScore,
		warnings: context.warnings,
		recentProposals: context.recentProposals,
	};
	return JSON.stringify(payload);
}

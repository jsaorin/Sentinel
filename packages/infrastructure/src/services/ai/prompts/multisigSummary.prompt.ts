import type { MultisigAnalysisContext } from "@sentinel/domain";

export const MULTISIG_SUMMARY_SYSTEM_PROMPT = `You are a security analyst for Solana multisigs (Squads v4). Given a multisig's configuration (threshold, signers, config authority), its computed health score, warnings, recent proposals, and any threat exposures linking its signers to external threat reports, produce a short behavioural summary.

Output a JSON object with exactly this field:
- "aiSummary": string. 2-3 sentences max. Plain English, no markdown. Describe the multisig's security posture (is the threshold meaningful? is power concentrated? is there an external config authority?) and, if relevant, note recent activity patterns.

If the input contains threatExposures, treat them as the most important signal: a signer linked to an "attacker" or "compromised" role means the multisig must be considered compromised. A "vulnerable" role is a serious risk that warrants key rotation. A "victim" or "unknown" role is informational. Mention the threat source label and category when summarising.

Do not invent signers, proposals, or threats not present in the input. Do not output anything outside the JSON object.`;

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
		threatExposures: context.threatExposures ?? [],
	};
	return JSON.stringify(payload);
}

import type { DecodedInstruction } from "../entities/DecodedInstruction.js";
import type { MultisigScoreWarning } from "../entities/MultisigScore.js";
import type { ProposalFlag } from "../entities/ProposalScore.js";

export type Recommendation = "SIGN" | "VERIFY" | "DO_NOT_SIGN";

export interface MultisigAnalysisContext {
	multisigId: string;
	address: string;
	threshold: number | null;
	configAuthority: string | null;
	signerCount: number;
	overallScore: number;
	warnings: MultisigScoreWarning[];
	recentProposals: Array<{
		proposalId: string;
		riskScore: number;
		summary: string;
	}>;
}

export interface ProposalAnalysisContext {
	proposalId: string;
	multisigId: string;
	riskScore: number;
	flags: ProposalFlag[];
	decodedInstructions: DecodedInstruction[];
	multisigContext: {
		overallScore: number;
		threshold: number | null;
		signerCount: number;
		warnings: MultisigScoreWarning[];
	};
}

export interface MultisigAISummary {
	aiSummary: string;
}

export interface ProposalAIAnalysis {
	aiAnalysis: string;
	recommendation: Recommendation;
}

export interface IAIAnalysisService {
	summarizeMultisig(
		context: MultisigAnalysisContext,
	): Promise<MultisigAISummary>;
	analyzeProposal(
		context: ProposalAnalysisContext,
	): Promise<ProposalAIAnalysis>;
}

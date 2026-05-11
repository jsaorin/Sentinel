import type {
	AffectedEntityKind,
	AffectedEntityRole,
} from "../entities/AffectedEntity.js";
import type { DecodedInstruction } from "../entities/DecodedInstruction.js";
import type { MultisigScoreWarning } from "../entities/MultisigScore.js";
import type { ProposalFlag } from "../entities/ProposalScore.js";
import type {
	ThreatCategory,
	ThreatSeverity,
} from "../entities/ThreatSignal.js";
import type { ThreatSource } from "../events/ThreatSignalReceived.js";

export type Recommendation = "SIGN" | "VERIFY" | "DO_NOT_SIGN";

export interface MultisigThreatExposureSummary {
	signerAddress: string;
	role: AffectedEntityRole | null;
	kind: AffectedEntityKind;
	severity: "critical" | "high" | "medium";
	threatSeverity: ThreatSeverity | null;
	threatCategory: ThreatCategory | null;
	sourceLabel: string | null;
	summary: string | null;
	capturedAt: string;
}

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
	threatExposures?: MultisigThreatExposureSummary[];
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

export interface ThreatAnalysisInput {
	source: ThreatSource;
	content: string;
}

export interface ThreatAnalysisEntity {
	kind: AffectedEntityKind;
	role: AffectedEntityRole | null;
	address: string;
	contextSnippet: string | null;
}

export interface ThreatAnalysisResult {
	isThreat: boolean;
	severity: ThreatSeverity | null;
	category: ThreatCategory | null;
	summary: string | null;
	entities: ThreatAnalysisEntity[];
	rawAnalysisJson: unknown;
}

export interface IAIAnalysisService {
	summarizeMultisig(
		context: MultisigAnalysisContext,
	): Promise<MultisigAISummary>;
	analyzeProposal(
		context: ProposalAnalysisContext,
	): Promise<ProposalAIAnalysis>;
	analyzeThreatSignal(
		input: ThreatAnalysisInput,
	): Promise<ThreatAnalysisResult>;
}

import type { DecodedInstruction } from "../entities/DecodedInstruction.js";
import type { MultisigScoreWarning } from "../entities/MultisigScore.js";
import type { MultisigThreatExposure } from "../entities/MultisigThreatExposure.js";
import type { NonceAccount } from "../entities/NonceAccount.js";
import type { ProposalFlag } from "../entities/ProposalScore.js";
import type { Signer } from "../entities/Signer.js";

export interface MultisigScoringContext {
	threshold: number | null;
	configAuthority: string | null;
	signers: Signer[];
	nonceAccounts?: NonceAccount[];
	threatExposures?: MultisigThreatExposure[];
	previousWarnings?: MultisigScoreWarning[];
}

export interface MultisigScoreData {
	overallScore: number;
	thresholdScore: number;
	configAuthorityScore: number;
	signerConcentrationScore: number;
	signerCountScore: number;
	warnings: MultisigScoreWarning[];
}

export interface ProposalScoringContext {
	proposalId: string;
	decodedInstructions: DecodedInstruction[];
	historicalActions: Set<string>;
}

export interface ProposalScoreData {
	proposalId: string;
	riskScore: number;
	flags: ProposalFlag[];
	summary: string;
}

export interface IScoringService {
	scoreMultisig(context: MultisigScoringContext): MultisigScoreData;
	scoreProposal(context: ProposalScoringContext): ProposalScoreData;
}

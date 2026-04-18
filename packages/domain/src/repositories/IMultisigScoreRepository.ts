import type {
	MultisigScore,
	MultisigScoreWarning,
} from "../entities/MultisigScore.js";

export interface UpsertMultisigScoreInput {
	multisigId: string;
	overallScore: number;
	thresholdScore: number;
	configAuthorityScore: number;
	signerConcentrationScore: number;
	signerCountScore: number;
	warnings: MultisigScoreWarning[];
}

export interface IMultisigScoreRepository {
	findByMultisigId(multisigId: string): Promise<MultisigScore | null>;
	upsert(input: UpsertMultisigScoreInput): Promise<MultisigScore>;
	updateAISummary(
		multisigId: string,
		aiSummary: string,
	): Promise<MultisigScore>;
}

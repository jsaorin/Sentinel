import type { MultisigScoreWarning } from "@sentinel/domain";

export type ScoreMultisigHealthCommandInputDto = {
	multisigId: string;
};

export type ScoreMultisigHealthCommandOutputDto = {
	multisigId: string;
	overallScore: number;
	thresholdScore: number;
	configAuthorityScore: number;
	signerConcentrationScore: number;
	signerCountScore: number;
	warnings: MultisigScoreWarning[];
};

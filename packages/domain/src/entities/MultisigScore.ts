export interface MultisigScoreWarning {
	code: string;
	message: string;
	subject: string | null;
	detectedAt: Date;
}

export class MultisigScore {
	public readonly id: string;
	public readonly multisigId: string;
	public readonly overallScore: number;
	public readonly thresholdScore: number;
	public readonly configAuthorityScore: number;
	public readonly signerConcentrationScore: number;
	public readonly signerCountScore: number;
	public readonly warnings: MultisigScoreWarning[];
	public readonly aiSummary: string | null;
	public readonly calculatedAt: Date;
	public readonly createdAt: Date;
	public readonly updatedAt: Date;

	constructor(params: {
		id: string;
		multisigId: string;
		overallScore: number;
		thresholdScore: number;
		configAuthorityScore: number;
		signerConcentrationScore: number;
		signerCountScore: number;
		warnings: MultisigScoreWarning[];
		aiSummary: string | null;
		calculatedAt: Date;
		createdAt: Date;
		updatedAt: Date;
	}) {
		this.id = params.id;
		this.multisigId = params.multisigId;
		this.overallScore = params.overallScore;
		this.thresholdScore = params.thresholdScore;
		this.configAuthorityScore = params.configAuthorityScore;
		this.signerConcentrationScore = params.signerConcentrationScore;
		this.signerCountScore = params.signerCountScore;
		this.warnings = params.warnings;
		this.aiSummary = params.aiSummary;
		this.calculatedAt = params.calculatedAt;
		this.createdAt = params.createdAt;
		this.updatedAt = params.updatedAt;
	}
}

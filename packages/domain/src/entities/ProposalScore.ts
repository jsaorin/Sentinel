export enum FlagType {
	DURABLE_NONCE = "DURABLE_NONCE",
	AUTHORITY_TRANSFER = "AUTHORITY_TRANSFER",
	UPGRADE_PROGRAM = "UPGRADE_PROGRAM",
	LARGE_TRANSFER = "LARGE_TRANSFER",
	UNKNOWN_PROGRAM = "UNKNOWN_PROGRAM",
	MULTI_INSTRUCTION = "MULTI_INSTRUCTION",
	FIRST_TIME_ACTION = "FIRST_TIME_ACTION",
}

export enum FlagSeverity {
	LOW = "LOW",
	MEDIUM = "MEDIUM",
	HIGH = "HIGH",
	CRITICAL = "CRITICAL",
}

export interface ProposalFlag {
	type: FlagType;
	severity: FlagSeverity;
	points: number;
	detail: string;
}

export class ProposalScore {
	public readonly id: string;
	public readonly proposalId: string;
	public readonly riskScore: number;
	public readonly flags: ProposalFlag[];
	public readonly summary: string;
	public readonly aiAnalysis: string | null;
	public readonly recommendation: string | null;
	public readonly calculatedAt: Date;
	public readonly createdAt: Date;
	public readonly updatedAt: Date;

	constructor(params: {
		id: string;
		proposalId: string;
		riskScore: number;
		flags: ProposalFlag[];
		summary: string;
		aiAnalysis: string | null;
		recommendation: string | null;
		calculatedAt: Date;
		createdAt: Date;
		updatedAt: Date;
	}) {
		this.id = params.id;
		this.proposalId = params.proposalId;
		this.riskScore = params.riskScore;
		this.flags = params.flags;
		this.summary = params.summary;
		this.aiAnalysis = params.aiAnalysis;
		this.recommendation = params.recommendation;
		this.calculatedAt = params.calculatedAt;
		this.createdAt = params.createdAt;
		this.updatedAt = params.updatedAt;
	}
}

export enum ProposalStatus {
	DRAFT = "DRAFT",
	ACTIVE = "ACTIVE",
	APPROVED = "APPROVED",
	REJECTED = "REJECTED",
	EXECUTED = "EXECUTED",
	CANCELLED = "CANCELLED",
}

export class Proposal {
	public readonly id: string;
	public readonly multisigId: string;
	public readonly proposalIndex: number;
	public readonly transactionIndex: number;
	public readonly pda: string;
	public readonly transactionPda: string;
	public readonly status: ProposalStatus;
	public readonly creator: string | null;
	public readonly createdAt: Date;
	public readonly executedAt: Date | null;

	constructor(params: {
		id: string;
		multisigId: string;
		proposalIndex: number;
		transactionIndex: number;
		pda: string;
		transactionPda: string;
		status: ProposalStatus;
		creator: string | null;
		createdAt: Date;
		executedAt: Date | null;
	}) {
		this.id = params.id;
		this.multisigId = params.multisigId;
		this.proposalIndex = params.proposalIndex;
		this.transactionIndex = params.transactionIndex;
		this.pda = params.pda;
		this.transactionPda = params.transactionPda;
		this.status = params.status;
		this.creator = params.creator;
		this.createdAt = params.createdAt;
		this.executedAt = params.executedAt;
	}
}

export class DecodedInstruction {
	public readonly id: string;
	public readonly proposalInstructionId: string;
	public readonly programName: string;
	public readonly action: string;
	public readonly params: Record<string, string>;
	public readonly accounts: Array<{ address: string; label: string }>;
	public readonly summary: string;
	public readonly isKnown: boolean;
	public readonly createdAt: Date;
	public readonly updatedAt: Date;

	constructor(params: {
		id: string;
		proposalInstructionId: string;
		programName: string;
		action: string;
		params: Record<string, string>;
		accounts: Array<{ address: string; label: string }>;
		summary: string;
		isKnown: boolean;
		createdAt: Date;
		updatedAt: Date;
	}) {
		this.id = params.id;
		this.proposalInstructionId = params.proposalInstructionId;
		this.programName = params.programName;
		this.action = params.action;
		this.params = params.params;
		this.accounts = params.accounts;
		this.summary = params.summary;
		this.isKnown = params.isKnown;
		this.createdAt = params.createdAt;
		this.updatedAt = params.updatedAt;
	}
}

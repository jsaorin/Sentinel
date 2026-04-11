export class ProposalInstruction {
	public readonly id: string;
	public readonly proposalId: string;
	public readonly instructionIndex: number;
	public readonly programId: string;
	public readonly data: string;
	public readonly accounts: string[];

	constructor(params: {
		id: string;
		proposalId: string;
		instructionIndex: number;
		programId: string;
		data: string;
		accounts: string[];
	}) {
		this.id = params.id;
		this.proposalId = params.proposalId;
		this.instructionIndex = params.instructionIndex;
		this.programId = params.programId;
		this.data = params.data;
		this.accounts = params.accounts;
	}
}

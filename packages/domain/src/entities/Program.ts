export type ProgramIdlSource = "on-chain" | "none";

export class Program {
	public readonly id: string;
	public readonly programId: string;
	public readonly name: string | null;
	public readonly idlJson: unknown | null;
	public readonly idlVersion: string | null;
	public readonly idlSource: ProgramIdlSource;
	public readonly idlChecksum: string | null;
	public readonly idlFetchedAt: Date | null;
	public readonly firstSeenAt: Date;
	public readonly lastSeenAt: Date;

	constructor(params: {
		id: string;
		programId: string;
		name: string | null;
		idlJson: unknown | null;
		idlVersion: string | null;
		idlSource: ProgramIdlSource;
		idlChecksum: string | null;
		idlFetchedAt: Date | null;
		firstSeenAt: Date;
		lastSeenAt: Date;
	}) {
		this.id = params.id;
		this.programId = params.programId;
		this.name = params.name;
		this.idlJson = params.idlJson;
		this.idlVersion = params.idlVersion;
		this.idlSource = params.idlSource;
		this.idlChecksum = params.idlChecksum;
		this.idlFetchedAt = params.idlFetchedAt;
		this.firstSeenAt = params.firstSeenAt;
		this.lastSeenAt = params.lastSeenAt;
	}
}

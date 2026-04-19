export interface ResolvedIdl {
	programId: string;
	name: string;
	version: string;
	raw: unknown;
}

export interface IIdlResolverService {
	resolve(programId: string): Promise<ResolvedIdl | null>;
}

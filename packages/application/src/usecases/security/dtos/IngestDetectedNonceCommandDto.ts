export type IngestDetectedNonceCommandInputDto = {
	address: string;
	authority: string;
	fundedBy: string | null;
};

export type IngestDetectedNonceCommandOutputDto = {
	persistedId: string | null;
	skipped: boolean;
	skipReason?: "unknown-authority" | "already-known";
};

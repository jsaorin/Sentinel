export type LinkThreatEntityToMultisigsCommandInputDto = {
	threatSignalId: string;
	threatSignalEntityId: string;
};

export type LinkThreatEntityToMultisigsCommandOutputDto = {
	affectedMultisigIds: string[];
	skipped: boolean;
	skippedReason?: string;
};

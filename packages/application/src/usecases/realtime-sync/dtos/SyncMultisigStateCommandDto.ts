import type { HeliusEventKind } from "@sentinel/domain";

export type SyncMultisigStateCommandInputDto = {
	multisigAddress: string;
	kind: HeliusEventKind;
	proposalPda?: string;
};

export type SyncMultisigStateCommandOutputDto = {
	skipped: boolean;
	configChanged: boolean;
	proposalsCreated: number;
	proposalsUpdated: number;
};

import type { HeliusEventKind } from "@sentinel/domain";

export type SyncMultisigStateCommandInputDto = {
	multisigAddress: string;
	kind: HeliusEventKind;
	proposalPda?: string;
	/** Slot of the webhook source tx; forwarded as RPC minContextSlot. */
	slot?: number;
};

export type SyncMultisigStateCommandOutputDto = {
	skipped: boolean;
	configChanged: boolean;
	proposalsCreated: number;
	proposalsUpdated: number;
};

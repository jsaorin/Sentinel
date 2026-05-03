export const REALTIME_ACTIONS = {
	AGENT_MESSAGE: "AGENT_MESSAGE",
	NEW_THREAT_SIGNAL: "NEW_THREAT_SIGNAL",
	NEW_ANALYSIS_PROPOSAL: "NEW_ANALYSIS_PROPOSAL",
	NEW_ANALYSIS_MULTISIG: "NEW_ANALYSIS_MULTISIG",
	MULTISIG_CONFIG_CHANGED: "MULTISIG_CONFIG_CHANGED",
	NEW_PROPOSAL: "NEW_PROPOSAL",
	PROPOSAL_UPDATED: "PROPOSAL_UPDATED",
} as const;

export type RealtimeAction =
	(typeof REALTIME_ACTIONS)[keyof typeof REALTIME_ACTIONS];

export interface MultisigConfigChanges {
	threshold?: { from: number; to: number };
	configAuthority?: { from: string | null; to: string | null };
	signersAdded?: string[];
	signersRemoved?: string[];
}

export interface RealtimePayloadMap {
	[REALTIME_ACTIONS.AGENT_MESSAGE]: { message: string };
	[REALTIME_ACTIONS.NEW_THREAT_SIGNAL]: { id: string };
	[REALTIME_ACTIONS.NEW_ANALYSIS_PROPOSAL]: { proposalId: string };
	[REALTIME_ACTIONS.NEW_ANALYSIS_MULTISIG]: { multisigId: string };
	[REALTIME_ACTIONS.MULTISIG_CONFIG_CHANGED]: {
		multisigId: string;
		changes: MultisigConfigChanges;
	};
	[REALTIME_ACTIONS.NEW_PROPOSAL]: {
		proposalId: string;
		multisigId: string;
		proposalIndex: number;
	};
	[REALTIME_ACTIONS.PROPOSAL_UPDATED]: {
		proposalId: string;
		multisigId: string;
		status: string;
		approverCount: number;
		rejecterCount: number;
	};
}

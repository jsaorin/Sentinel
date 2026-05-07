"use client";

import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { REALTIME_ROOMS, REALTIME_ACTIONS } from "@sentinel/common/realtime";

const ACTIONS = [
	REALTIME_ACTIONS.MULTISIG_CONFIG_CHANGED,
	REALTIME_ACTIONS.NEW_ANALYSIS_MULTISIG,
	REALTIME_ACTIONS.NONCE_ACCOUNT_DETECTED,
	REALTIME_ACTIONS.NEW_PROPOSAL,
	REALTIME_ACTIONS.PROPOSAL_UPDATED,
] as const;

export function MultisigRealtimeRefresh({
	multisigId,
}: { multisigId: string }) {
	useRealtimeRefresh(REALTIME_ROOMS.multisig(multisigId), [...ACTIONS]);
	return null;
}

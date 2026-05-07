"use client";

import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { REALTIME_ROOMS, REALTIME_ACTIONS } from "@sentinel/common/realtime";

const ACTIONS = [
	REALTIME_ACTIONS.PROPOSAL_UPDATED,
	REALTIME_ACTIONS.NEW_ANALYSIS_PROPOSAL,
] as const;

export function ProposalRealtimeRefresh({
	proposalId,
}: { proposalId: string }) {
	useRealtimeRefresh(REALTIME_ROOMS.proposal(proposalId), [...ACTIONS]);
	return null;
}

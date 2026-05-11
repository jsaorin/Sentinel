"use client";

import { useWatcherFeed } from "@/hooks/useWatcherFeed";
import type {
	PaginationResponse,
	ThreatSignalListItemResponse,
} from "@/lib/api";
import { useCallback, useState } from "react";
import { AgentFeed } from "./AgentFeed";
import { ThreatSignalsTable } from "./ThreatSignalsTable";

const MAX_MESSAGES = 200;

type AgentMessage = {
	message: string;
	timestamp: Date;
};

type ScannerClientProps = {
	initialSignals: ThreatSignalListItemResponse[];
	initialPagination: PaginationResponse;
};

export function ScannerClient({
	initialSignals,
	initialPagination,
}: ScannerClientProps) {
	const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);

	const handleAgentMessage = useCallback((msg: string) => {
		setAgentMessages((prev) =>
			[...prev, { message: msg, timestamp: new Date() }].slice(-MAX_MESSAGES),
		);
	}, []);

	const handleNewThreatSignal = useCallback(() => {
		setRefreshKey((k) => k + 1);
	}, []);

	useWatcherFeed({
		onAgentMessage: handleAgentMessage,
		onNewThreatSignal: handleNewThreatSignal,
	});

	return (
		<div className="flex flex-col gap-6">
			<AgentFeed messages={agentMessages} />
			<ThreatSignalsTable
				initialItems={initialSignals}
				initialPagination={initialPagination}
				refreshKey={refreshKey}
			/>
		</div>
	);
}

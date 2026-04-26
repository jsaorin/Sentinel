"use client";

import { useState, useCallback } from "react";
import { useWatcherFeed } from "@/hooks/useWatcherFeed";
import { AgentFeed } from "./AgentFeed";
import { ThreatSignalsTable } from "./ThreatSignalsTable";
import type {
	ThreatSignalListItemResponse,
	PaginationResponse,
} from "@/lib/api";

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
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="lg:col-span-1">
				<AgentFeed messages={agentMessages} />
			</div>
			<div className="lg:col-span-2">
				<ThreatSignalsTable
					initialItems={initialSignals}
					initialPagination={initialPagination}
					refreshKey={refreshKey}
				/>
			</div>
		</div>
	);
}

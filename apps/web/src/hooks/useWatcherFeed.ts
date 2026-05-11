"use client";

import { useRealtimeSocket } from "@/contexts/RealtimeContext";
import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";
import { useEffect, useRef } from "react";

export function useWatcherFeed(opts: {
	onAgentMessage: (msg: string) => void;
	onNewThreatSignal: () => void;
}) {
	const { socket, subscribe, unsubscribe } = useRealtimeSocket();
	const optsRef = useRef(opts);
	optsRef.current = opts;

	useEffect(() => {
		if (!socket) return;
		const room = REALTIME_ROOMS.watcherFeed();
		subscribe(room);

		socket.on(REALTIME_ACTIONS.AGENT_MESSAGE, (data) => {
			optsRef.current.onAgentMessage(data.message);
		});

		socket.on(REALTIME_ACTIONS.NEW_THREAT_SIGNAL, () => {
			optsRef.current.onNewThreatSignal();
		});

		return () => {
			socket.off(REALTIME_ACTIONS.AGENT_MESSAGE);
			socket.off(REALTIME_ACTIONS.NEW_THREAT_SIGNAL);
			unsubscribe(room);
		};
	}, [socket, subscribe, unsubscribe]);
}

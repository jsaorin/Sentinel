"use client";

import { useEffect, useRef } from "react";
import { createRealtimeSocket, type RealtimeSocket } from "@/lib/realtime";
import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";

export function useWatcherFeed(opts: {
	onAgentMessage: (msg: string) => void;
	onNewThreatSignal: () => void;
}) {
	const optsRef = useRef(opts);
	optsRef.current = opts;

	useEffect(() => {
		const socket: RealtimeSocket = createRealtimeSocket(
			process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
		);
		const room = REALTIME_ROOMS.watcherFeed();
		socket.emit("subscribe", room);

		socket.on(REALTIME_ACTIONS.AGENT_MESSAGE, (data) => {
			optsRef.current.onAgentMessage(data.message);
		});

		socket.on(REALTIME_ACTIONS.NEW_THREAT_SIGNAL, () => {
			optsRef.current.onNewThreatSignal();
		});

		return () => {
			socket.emit("unsubscribe", room);
			socket.off(REALTIME_ACTIONS.AGENT_MESSAGE);
			socket.off(REALTIME_ACTIONS.NEW_THREAT_SIGNAL);
			socket.close();
		};
	}, []);
}

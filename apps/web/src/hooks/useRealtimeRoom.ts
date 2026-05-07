"use client";

import { useEffect, useRef } from "react";
import { useRealtimeSocket } from "@/contexts/RealtimeContext";
import type {
	RealtimeAction,
	RealtimePayloadMap,
} from "@sentinel/common/realtime";

export function useRealtimeRoom<A extends RealtimeAction>(
	room: string,
	action: A,
	handler: (data: RealtimePayloadMap[A]) => void,
) {
	const { socket, subscribe, unsubscribe } = useRealtimeSocket();
	const handlerRef = useRef(handler);
	handlerRef.current = handler;

	useEffect(() => {
		if (!socket) return;
		subscribe(room);

		const listener = (data: RealtimePayloadMap[A]) =>
			handlerRef.current(data);
		socket.on(action, listener as never);

		return () => {
			socket.off(action, listener as never);
			unsubscribe(room);
		};
	}, [socket, room, action, subscribe, unsubscribe]);
}

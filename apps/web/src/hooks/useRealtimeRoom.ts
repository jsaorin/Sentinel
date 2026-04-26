"use client";

import { useEffect } from "react";
import { createRealtimeSocket, type RealtimeSocket } from "@/lib/realtime";
import type {
	RealtimeAction,
	RealtimePayloadMap,
} from "@sentinel/common/realtime";

export function useRealtimeRoom<A extends RealtimeAction>(
	room: string,
	action: A,
	handler: (data: RealtimePayloadMap[A]) => void,
) {
	useEffect(() => {
		const socket: RealtimeSocket = createRealtimeSocket(
			process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
		);
		socket.emit("subscribe", room);
		socket.on(action, handler as never);

		return () => {
			socket.emit("unsubscribe", room);
			socket.off(action, handler as never);
			socket.close();
		};
	}, [room, action, handler]);
}

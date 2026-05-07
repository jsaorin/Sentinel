"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeSocket } from "@/contexts/RealtimeContext";
import type { RealtimeAction } from "@sentinel/common/realtime";

export function useRealtimeRefresh(
	room: string,
	actions: RealtimeAction[],
) {
	const router = useRouter();
	const { socket, subscribe, unsubscribe } = useRealtimeSocket();
	const actionsRef = useRef(actions);
	actionsRef.current = actions;

	useEffect(() => {
		if (!socket) return;
		subscribe(room);

		let debounceTimer: ReturnType<typeof setTimeout>;
		const handler = () => {
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => router.refresh(), 300);
		};

		for (const action of actionsRef.current) {
			socket.on(action, handler as never);
		}

		return () => {
			clearTimeout(debounceTimer);
			for (const action of actionsRef.current) {
				socket.off(action, handler as never);
			}
			unsubscribe(room);
		};
	}, [socket, room, subscribe, unsubscribe, router]);
}

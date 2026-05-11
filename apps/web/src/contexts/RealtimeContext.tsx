"use client";

import { type RealtimeSocket, createRealtimeSocket } from "@/lib/realtime";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

type RealtimeContextValue = {
	socket: RealtimeSocket | null;
	subscribe: (room: string) => void;
	unsubscribe: (room: string) => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({ children }: { children: ReactNode }) {
	const [socket, setSocket] = useState<RealtimeSocket | null>(null);
	const roomCounts = useRef<Map<string, number>>(new Map());

	useEffect(() => {
		const s = createRealtimeSocket(
			process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
		);

		s.on("connect", () => {
			for (const [room, count] of roomCounts.current) {
				if (count > 0) s.emit("subscribe", room);
			}
		});

		setSocket(s);

		return () => {
			s.close();
		};
	}, []);

	const subscribe = useCallback(
		(room: string) => {
			const current = roomCounts.current.get(room) ?? 0;
			roomCounts.current.set(room, current + 1);
			if (current === 0 && socket?.connected) {
				socket.emit("subscribe", room);
			}
		},
		[socket],
	);

	const unsubscribe = useCallback(
		(room: string) => {
			const current = roomCounts.current.get(room) ?? 0;
			if (current <= 1) {
				roomCounts.current.delete(room);
				if (socket?.connected) {
					socket.emit("unsubscribe", room);
				}
			} else {
				roomCounts.current.set(room, current - 1);
			}
		},
		[socket],
	);

	return (
		<RealtimeContext value={{ socket, subscribe, unsubscribe }}>
			{children}
		</RealtimeContext>
	);
}

export function useRealtimeSocket(): RealtimeContextValue {
	const ctx = useContext(RealtimeContext);
	if (!ctx) {
		throw new Error("useRealtimeSocket must be used within a RealtimeProvider");
	}
	return ctx;
}

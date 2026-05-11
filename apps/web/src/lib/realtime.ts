import type {
	RealtimeClientToServerEvents,
	RealtimeServerToClientEvents,
} from "@sentinel/common/realtime";
import { type Socket, io } from "socket.io-client";

export type RealtimeSocket = Socket<
	RealtimeServerToClientEvents,
	RealtimeClientToServerEvents
>;

export function createRealtimeSocket(apiUrl: string): RealtimeSocket {
	const origin = new URL(apiUrl).origin;
	return io(origin, { path: "/ws", transports: ["websocket"] });
}

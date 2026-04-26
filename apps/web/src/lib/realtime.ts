import { io, type Socket } from "socket.io-client";
import type {
	RealtimeServerToClientEvents,
	RealtimeClientToServerEvents,
} from "@sentinel/common/realtime";

export type RealtimeSocket = Socket<
	RealtimeServerToClientEvents,
	RealtimeClientToServerEvents
>;

export function createRealtimeSocket(apiUrl: string): RealtimeSocket {
	return io(apiUrl, { path: "/ws", transports: ["websocket"] });
}

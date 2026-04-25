import type { RealtimeAction, RealtimePayloadMap } from "./actions.js";

export type RealtimeMessage = {
	[A in RealtimeAction]: {
		action: A;
		data: RealtimePayloadMap[A];
		timestamp: string;
	};
}[RealtimeAction];

export type RealtimeServerToClientEvents = {
	[A in RealtimeAction]: (data: RealtimePayloadMap[A]) => void;
};

export type RealtimeClientToServerEvents = {
	subscribe: (room: string, ack?: (ok: boolean) => void) => void;
	unsubscribe: (room: string) => void;
};

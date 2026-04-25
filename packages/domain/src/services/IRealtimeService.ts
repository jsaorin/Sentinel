import type { RealtimeAction, RealtimePayloadMap } from "@sentinel/common";

export interface IRealtimeService {
	emitToRoom<A extends RealtimeAction>(
		room: string,
		action: A,
		data: RealtimePayloadMap[A],
	): Promise<void>;
	broadcast<A extends RealtimeAction>(
		action: A,
		data: RealtimePayloadMap[A],
	): Promise<void>;
}

export const REALTIME_ROOMS = {
	watcherFeed: () => "watcher:feed" as const,
	multisig: (id: string) => `multisig:${id}` as const,
	proposal: (id: string) => `proposal:${id}` as const,
};

export const REALTIME_REDIS_CHANNEL = "sentinel.realtime";

import type { RetryConfig } from "./types.js";

export function computeDelayMs(attempt: number, cfg: RetryConfig): number {
	let base = 0;
	if (cfg.backoff.kind === "fixed") {
		base = cfg.backoff.baseMs;
	} else {
		const factor = cfg.backoff.factor ?? 2;
		const raw = cfg.backoff.baseMs * factor ** (attempt - 1);
		const max = cfg.backoff.maxMs ?? Number.MAX_SAFE_INTEGER;
		base = Math.min(raw, max);
	}

	if (!cfg.jitter) return base;
	if (cfg.jitter.type === "full") {
		return Math.floor(Math.random() * base);
	}

	const p = cfg.jitter.percent;
	const delta = base * p;
	const min = Math.max(0, base - delta);
	const max = base + delta;
	return Math.floor(min + Math.random() * (max - min));
}

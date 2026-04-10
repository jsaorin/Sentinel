export interface InboxStore {
	/** Return true if the message was already processed. */
	isProcessed(messageId: string): Promise<boolean>;

	/** Mark message as processed (idempotent). */
	markProcessed(messageId: string, ttlSeconds?: number): Promise<void>;

	/** Try to acquire a short-lived lock for this message; return true if acquired. */
	tryAcquireLock(messageId: string, lockTtlSeconds?: number): Promise<boolean>;

	/** Release the lock (best-effort). */
	releaseLock(messageId: string): Promise<void>;

	close(): Promise<void>;

	ping(): Promise<string>;
}

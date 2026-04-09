const DOMAIN_REPOSITORY_TYPES = {
	TransactionManager: Symbol.for("TransactionManager"),
	OutboxEventRepository: Symbol.for("OutboxEventRepository"),
	WebhookConfigRepository: Symbol.for("WebhookConfigRepository"),
};

export const DOMAIN_SERVICE_TYPES = {
	Logger: Symbol.for("Logger"),
	CacheService: Symbol.for("CacheService"),
};

export const DOMAIN_CONFIG_TYPES = {};

export const DOMAIN_TYPES = {
	...DOMAIN_REPOSITORY_TYPES,
	...DOMAIN_SERVICE_TYPES,
	...DOMAIN_CONFIG_TYPES,
};

export type DomainTypes = typeof DOMAIN_TYPES;

const DOMAIN_REPOSITORY_TYPES = {
	TransactionManager: Symbol.for("TransactionManager"),
	OutboxEventRepository: Symbol.for("OutboxEventRepository"),
	WebhookConfigRepository: Symbol.for("WebhookConfigRepository"),
	MultisigRepository: Symbol.for("MultisigRepository"),
};

export const DOMAIN_SERVICE_TYPES = {
	Logger: Symbol.for("Logger"),
	CacheService: Symbol.for("CacheService"),
	HeliusWebhookService: Symbol.for("HeliusWebhookService"),
};

export const DOMAIN_CONFIG_TYPES = {
	HeliusApiConfig: Symbol.for("HeliusApiConfig"),
};

export const DOMAIN_TYPES = {
	...DOMAIN_REPOSITORY_TYPES,
	...DOMAIN_SERVICE_TYPES,
	...DOMAIN_CONFIG_TYPES,
};

export type DomainTypes = typeof DOMAIN_TYPES;

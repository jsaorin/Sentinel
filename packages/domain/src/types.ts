const DOMAIN_REPOSITORY_TYPES = {
	TransactionManager: Symbol.for("TransactionManager"),
	OutboxEventRepository: Symbol.for("OutboxEventRepository"),
	WebhookConfigRepository: Symbol.for("WebhookConfigRepository"),
	MultisigRepository: Symbol.for("MultisigRepository"),
	SignerRepository: Symbol.for("SignerRepository"),
	ProposalRepository: Symbol.for("ProposalRepository"),
	ProposalInstructionRepository: Symbol.for("ProposalInstructionRepository"),
	VaultRepository: Symbol.for("VaultRepository"),
	DecodedInstructionRepository: Symbol.for("DecodedInstructionRepository"),
	MultisigScoreRepository: Symbol.for("MultisigScoreRepository"),
	ProposalScoreRepository: Symbol.for("ProposalScoreRepository"),
};

export const DOMAIN_SERVICE_TYPES = {
	Logger: Symbol.for("Logger"),
	CacheService: Symbol.for("CacheService"),
	HeliusWebhookService: Symbol.for("HeliusWebhookService"),
	SquadsService: Symbol.for("SquadsService"),
	InstructionDecoderService: Symbol.for("InstructionDecoderService"),
	ScoringService: Symbol.for("ScoringService"),
};

export const DOMAIN_CONFIG_TYPES = {
	HeliusApiConfig: Symbol.for("HeliusApiConfig"),
	RedisConfig: Symbol.for("RedisConfig"),
};

export const DOMAIN_TYPES = {
	...DOMAIN_REPOSITORY_TYPES,
	...DOMAIN_SERVICE_TYPES,
	...DOMAIN_CONFIG_TYPES,
};

export type DomainTypes = typeof DOMAIN_TYPES;

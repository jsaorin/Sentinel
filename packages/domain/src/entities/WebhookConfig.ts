export enum WebhookType {
	MULTISIG_ACTIVITY = "MULTISIG_ACTIVITY",
	ADDRESS_ACTIVITY = "ADDRESS_ACTIVITY",
}

export class WebhookConfig {
	public readonly id: string;
	public readonly heliusWebhookId: string;
	public readonly type: WebhookType;
	public readonly createdAt: Date;
	public readonly updatedAt: Date;

	constructor(params: {
		id: string;
		heliusWebhookId: string;
		type: WebhookType;
		createdAt: Date;
		updatedAt: Date;
	}) {
		this.id = params.id;
		this.heliusWebhookId = params.heliusWebhookId;
		this.type = params.type;
		this.createdAt = params.createdAt;
		this.updatedAt = params.updatedAt;
	}
}

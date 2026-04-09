export type SaveWebhookEventCommandInputDto = {
	payload: Record<string, unknown>[];
};

export type SaveWebhookEventCommandOutputDto = {
	savedCount: number;
};

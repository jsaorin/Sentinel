import { z } from "zod";

const HeliusInstructionSchema = z
	.object({
		programId: z.string().optional(),
		data: z.string().optional(),
		accounts: z.array(z.string()).optional(),
		innerInstructions: z.array(z.unknown()).optional(),
	})
	.passthrough();

export const HeliusWebhookEventSchema = z.object({
	id: z.string(),
	type: z.literal("webhook.helius.received"),
	time: z.string(),
	data: z
		.object({
			signature: z.string().optional(),
			instructions: z.array(HeliusInstructionSchema).optional(),
		})
		.passthrough(),
});

export type HeliusWebhookEvent = z.infer<typeof HeliusWebhookEventSchema>;

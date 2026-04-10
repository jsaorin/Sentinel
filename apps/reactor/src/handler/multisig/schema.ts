import { z } from "zod";

export const MultisigCreatedSchema = z.object({
	id: z.string(),
	type: z.literal("multisig.created"),
	time: z.string(),
	data: z.object({
		multisigId: z.string(),
		address: z.string(),
	}),
});

export type MultisigCreatedEvent = z.infer<typeof MultisigCreatedSchema>;

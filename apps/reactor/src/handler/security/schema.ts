import { z } from "zod";

export const MultisigNonceScanRequestedSchema = z.object({
	id: z.string(),
	type: z.literal("multisig.scan.nonces.requested"),
	time: z.string(),
	data: z.object({
		multisigAddress: z.string(),
	}),
});

export type MultisigNonceScanRequestedEvent = z.infer<
	typeof MultisigNonceScanRequestedSchema
>;

import { z } from "zod";

export const ThreatSignalReceivedSchema = z.object({
	id: z.string(),
	type: z.literal("threat.signal.received"),
	time: z.string(),
	data: z.object({
		source: z.object({
			kind: z.enum(["telegram", "twitter", "rss"]),
			identifier: z.string().min(1),
			label: z.string().optional(),
		}),
		externalId: z.string().min(1),
		content: z.string().min(1),
		capturedAt: z.string(),
	}),
});

export type ThreatSignalReceivedEvent = z.infer<
	typeof ThreatSignalReceivedSchema
>;

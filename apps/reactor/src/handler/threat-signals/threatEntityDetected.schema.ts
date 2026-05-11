import { z } from "zod";

export const ThreatEntityDetectedSchema = z.object({
	id: z.string(),
	type: z.literal("threat.entity.detected"),
	time: z.string(),
	data: z.object({
		threatSignalEntityId: z.string().min(1),
		threatSignalId: z.string().min(1),
	}),
});

export type ThreatEntityDetectedEvent = z.infer<
	typeof ThreatEntityDetectedSchema
>;

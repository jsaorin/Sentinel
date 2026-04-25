import { z } from "zod";

export const ListThreatSignalsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	sourceKind: z.enum(["telegram", "twitter", "rss"]).optional(),
	isThreat: z
		.union([
			z.boolean(),
			z.enum(["true", "false"]).transform((v) => v === "true"),
		])
		.optional()
		.default(true),
	sortBy: z.enum(["capturedAt", "createdAt"]).default("capturedAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ListThreatSignalsQueryParams = z.infer<
	typeof ListThreatSignalsQuerySchema
>;

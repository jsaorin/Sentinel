import { z } from "zod";

export const ListProposalsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type ListProposalsQueryParams = z.infer<typeof ListProposalsQuerySchema>;

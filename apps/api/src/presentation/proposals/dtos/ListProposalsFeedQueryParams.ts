import { ProposalStatus } from "@sentinel/domain";
import { z } from "zod";

export const ListProposalsFeedQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	sortBy: z.enum(["createdAt", "executedAt"]).default("createdAt"),
	status: z.nativeEnum(ProposalStatus).optional(),
});

export type ListProposalsFeedQueryParams = z.infer<
	typeof ListProposalsFeedQuerySchema
>;

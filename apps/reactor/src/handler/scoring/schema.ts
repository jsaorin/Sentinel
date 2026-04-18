import { z } from "zod";

export const MultisigScoredSchema = z.object({
	id: z.string(),
	type: z.literal("multisig.scored"),
	time: z.string(),
	data: z.object({
		multisigId: z.string(),
		overallScore: z.number(),
	}),
});

export type MultisigScoredEvent = z.infer<typeof MultisigScoredSchema>;

export const ProposalScoredSchema = z.object({
	id: z.string(),
	type: z.literal("proposal.scored"),
	time: z.string(),
	data: z.object({
		multisigId: z.string(),
		proposalId: z.string(),
		riskScore: z.number(),
	}),
});

export type ProposalScoredEvent = z.infer<typeof ProposalScoredSchema>;

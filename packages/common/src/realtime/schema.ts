import { z } from "zod";
import { REALTIME_ACTIONS } from "./actions.js";

const agentMessageSchema = z.object({
	action: z.literal(REALTIME_ACTIONS.AGENT_MESSAGE),
	data: z.object({ message: z.string() }),
});

const newThreatSignalSchema = z.object({
	action: z.literal(REALTIME_ACTIONS.NEW_THREAT_SIGNAL),
	data: z.object({ id: z.string() }),
});

const newAnalysisProposalSchema = z.object({
	action: z.literal(REALTIME_ACTIONS.NEW_ANALYSIS_PROPOSAL),
	data: z.object({ proposalId: z.string() }),
});

const newAnalysisMultisigSchema = z.object({
	action: z.literal(REALTIME_ACTIONS.NEW_ANALYSIS_MULTISIG),
	data: z.object({ multisigId: z.string() }),
});

const actionSchema = z.discriminatedUnion("action", [
	agentMessageSchema,
	newThreatSignalSchema,
	newAnalysisProposalSchema,
	newAnalysisMultisigSchema,
]);

const baseSchema = z.object({
	timestamp: z.string(),
});

const roomEnvelopeSchema = baseSchema.extend({
	type: z.literal("room"),
	room: z.string().min(1),
});

const broadcastEnvelopeSchema = baseSchema.extend({
	type: z.literal("broadcast"),
});

export const realtimeEnvelopeSchema = z.union([
	z.intersection(roomEnvelopeSchema, actionSchema),
	z.intersection(broadcastEnvelopeSchema, actionSchema),
]);

export type RealtimeEnvelope = z.infer<typeof realtimeEnvelopeSchema>;

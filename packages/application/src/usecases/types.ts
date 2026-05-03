import { AI_USE_CASE_TYPES } from "./ai/types.js";
import { HEALTH_USE_CASE_TYPES } from "./health/types.js";
import { INSTRUCTION_USE_CASE_TYPES } from "./instructions/types.js";
import { MULTISIG_USE_CASE_TYPES } from "./multisigs/types.js";
import { PROPOSAL_USE_CASE_TYPES } from "./proposals/types.js";
import { REALTIME_SYNC_USE_CASE_TYPES } from "./realtime-sync/types.js";
import { SCORING_USE_CASE_TYPES } from "./scoring/types.js";
import { THREAT_SIGNAL_USE_CASE_TYPES } from "./threat-signals/types.js";
import { WEBHOOK_USE_CASE_TYPES } from "./webhooks/types.js";

export const USECASES_TYPES = {
	Logger: Symbol.for("Logger"),
	...HEALTH_USE_CASE_TYPES,
	...WEBHOOK_USE_CASE_TYPES,
	...MULTISIG_USE_CASE_TYPES,
	...PROPOSAL_USE_CASE_TYPES,
	...INSTRUCTION_USE_CASE_TYPES,
	...SCORING_USE_CASE_TYPES,
	...AI_USE_CASE_TYPES,
	...THREAT_SIGNAL_USE_CASE_TYPES,
	...REALTIME_SYNC_USE_CASE_TYPES,
};

export type UseCasesTypes = typeof USECASES_TYPES;

import { HEALTH_USE_CASE_TYPES } from "./health/types.js";
import { INSTRUCTION_USE_CASE_TYPES } from "./instructions/types.js";
import { MULTISIG_USE_CASE_TYPES } from "./multisigs/types.js";
import { WEBHOOK_USE_CASE_TYPES } from "./webhooks/types.js";

export const USECASES_TYPES = {
	Logger: Symbol.for("Logger"),
	...HEALTH_USE_CASE_TYPES,
	...WEBHOOK_USE_CASE_TYPES,
	...MULTISIG_USE_CASE_TYPES,
	...INSTRUCTION_USE_CASE_TYPES,
};

export type UseCasesTypes = typeof USECASES_TYPES;

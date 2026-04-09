import { HEALTH_USE_CASE_TYPES } from "./health/types.js";

export const USECASES_TYPES = {
	Logger: Symbol.for("Logger"),
	...HEALTH_USE_CASE_TYPES,
};

export type UseCasesTypes = typeof USECASES_TYPES;

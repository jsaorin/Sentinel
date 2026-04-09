import { PORT_TYPES } from "./ports/types.js";
import { USECASES_TYPES } from "./usecases/types.js";

export const APPLICATION_TYPES = {
	...USECASES_TYPES,
	...PORT_TYPES,
};

export type ApplicationTypes = typeof APPLICATION_TYPES;

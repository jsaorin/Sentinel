import { DOMAIN_TYPES } from "@sentinel/domain";
import { CONFIG_TYPES } from "./config/configTypes.js";
import { CONTROLLER_TYPES } from "./controller/controllerTypes.js";

export const TYPES = {
	...CONFIG_TYPES,
	...DOMAIN_TYPES,
	...CONTROLLER_TYPES,
};

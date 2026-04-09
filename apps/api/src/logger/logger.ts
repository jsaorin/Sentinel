import { LoggerWrapper } from "@sentinel/common/logger";
import environment from "../env/api-environment.js";

export const logger = new LoggerWrapper("api", environment.isLocal());

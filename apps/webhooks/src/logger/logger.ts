import { LoggerWrapper } from "@sentinel/common/logger";
import environment from "../env/webhooks-environment.js";

export const logger = new LoggerWrapper("webhooks", environment.isLocal());

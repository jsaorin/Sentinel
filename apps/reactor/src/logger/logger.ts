import { LoggerWrapper } from "@sentinel/common/logger";
import environment from "../env/reactor-environment.js";

export const logger = new LoggerWrapper("reactor", environment.isLocal());

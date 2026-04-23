import { LoggerWrapper } from "@sentinel/common/logger";
import environment from "../env/watcher-environment.js";

export const logger = new LoggerWrapper("watcher", environment.isLocal());

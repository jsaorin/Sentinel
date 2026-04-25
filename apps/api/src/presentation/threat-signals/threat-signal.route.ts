import { QueryValidator } from "@sentinel/common/middlewares";
import { Router } from "express";
import { CONTROLLER_TYPES } from "../../container/controller/controllerTypes.js";
import { container } from "../../inversify.config.js";
import { logger } from "../../logger/logger.js";
import { ListThreatSignalsQuerySchema } from "./dtos/ListThreatSignalsQueryParams.js";
import type { ThreatSignalController } from "./ThreatSignalController.js";

const router: Router = Router();

const controller = container.get<ThreatSignalController>(
	CONTROLLER_TYPES.ThreatSignalController,
);

router.get(
	"/threat-signals",
	QueryValidator.validate(logger, ListThreatSignalsQuerySchema),
	controller.list.bind(controller),
);

export default router;

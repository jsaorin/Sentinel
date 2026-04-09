import { Router } from "express";
import { CONTROLLER_TYPES } from "../../container/controller/controllerTypes.js";
import { container } from "../../inversify.config.js";
import type { HealthController } from "./HealthController.js";

const router: Router = Router();

const controller = container.get<HealthController>(
	CONTROLLER_TYPES.HealthController,
);

router.get("/health", (req, res, next) => {
	controller.health(req, res).catch(next);
});

export default router;

import { Router } from "express";
import { CONTROLLER_TYPES } from "../../container/controller/controllerTypes.js";
import { container } from "../../inversify.config.js";
import type { HealthController } from "../health/HealthController.js";
import webhooks from "./webhooks.route.js";

const router: Router = Router();

const healthController = container.get<HealthController>(
	CONTROLLER_TYPES.HealthController,
);

router.use("/webhooks", webhooks);
router.get("/health", (req, res, next) => {
	healthController.health(req, res).catch(next);
});

export default router;

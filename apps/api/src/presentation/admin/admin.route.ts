import { Router } from "express";
import { CONTROLLER_TYPES } from "../../container/controller/controllerTypes.js";
import { container } from "../../inversify.config.js";
import { basicAuth } from "../../middlewares/basicAuth.js";
import type { AdminController } from "./AdminController.js";

const router: Router = Router();

const controller = container.get<AdminController>(
	CONTROLLER_TYPES.AdminController,
);

router.post(
	"/admin/scan-nonces",
	basicAuth(),
	controller.triggerNonceScan.bind(controller),
);

export default router;

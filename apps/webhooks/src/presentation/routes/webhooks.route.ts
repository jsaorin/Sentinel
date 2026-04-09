import { Router } from "express";
import { CONTROLLER_TYPES } from "../../container/controller/controllerTypes.js";
import environment from "../../env/webhooks-environment.js";
import { container } from "../../inversify.config.js";
import { validateWebhookAuth } from "../../middlewares/webhookAuth.js";
import type { HeliusWebhookController } from "../controllers/HeliusWebhookController.js";

const router: Router = Router();

const controller = container.get<HeliusWebhookController>(
	CONTROLLER_TYPES.HeliusWebhookController,
);

router.post(
	"/helius",
	validateWebhookAuth(environment.heliusWebhookAuthToken),
	controller.handleHeliusWebhook.bind(controller),
);

export default router;

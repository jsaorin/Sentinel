import { BodyValidator } from "@sentinel/common/middlewares";
import { Router } from "express";
import { CONTROLLER_TYPES } from "../../container/controller/controllerTypes.js";
import { container } from "../../inversify.config.js";
import { logger } from "../../logger/logger.js";
import type { MultisigController } from "./MultisigController.js";
import { CreateMultisigSchema } from "./dtos/CreateMultisigParams.js";

const router: Router = Router();

const controller = container.get<MultisigController>(
	CONTROLLER_TYPES.MultisigController,
);

router.post(
	"/multisigs",
	BodyValidator.validate(logger, CreateMultisigSchema),
	controller.create.bind(controller),
);

router.get(
	"/multisigs/:multisigId/proposals",
	controller.listProposals.bind(controller),
);

export default router;

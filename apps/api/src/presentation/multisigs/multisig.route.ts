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

router.get("/multisigs", controller.list.bind(controller));

router.get("/multisigs/:address", controller.getMultisig.bind(controller));

router.get(
	"/multisigs/:address/signers",
	controller.listSigners.bind(controller),
);

router.get(
	"/multisigs/:address/proposals",
	controller.listProposals.bind(controller),
);

export default router;

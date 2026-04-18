import { Router } from "express";
import { CONTROLLER_TYPES } from "../../container/controller/controllerTypes.js";
import { container } from "../../inversify.config.js";
import type { ProposalController } from "./ProposalController.js";

const router: Router = Router();

const controller = container.get<ProposalController>(
	CONTROLLER_TYPES.ProposalController,
);

router.get("/proposals/:proposalId", controller.getDetail.bind(controller));

export default router;

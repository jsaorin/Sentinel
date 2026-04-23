import { QueryValidator } from "@sentinel/common/middlewares";
import { Router } from "express";
import { CONTROLLER_TYPES } from "../../container/controller/controllerTypes.js";
import { container } from "../../inversify.config.js";
import { logger } from "../../logger/logger.js";
import type { ProposalController } from "./ProposalController.js";
import { ListProposalsFeedQuerySchema } from "./dtos/ListProposalsFeedQueryParams.js";

const router: Router = Router();

const controller = container.get<ProposalController>(
	CONTROLLER_TYPES.ProposalController,
);

router.get(
	"/proposals",
	QueryValidator.validate(logger, ListProposalsFeedQuerySchema),
	controller.listFeed.bind(controller),
);

router.get("/proposals/:proposalId", controller.getDetail.bind(controller));

export default router;

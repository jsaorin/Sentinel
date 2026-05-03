import { Router } from "express";
import admin from "./admin/admin.route.js";
import health from "./health/health.route.js";
import multisig from "./multisigs/multisig.route.js";
import proposal from "./proposals/proposal.route.js";
import threatSignal from "./threat-signals/threat-signal.route.js";

const router: Router = Router();

router.use("/", health);
router.use("/", multisig);
router.use("/", proposal);
router.use("/", threatSignal);
router.use("/", admin);

export default router;

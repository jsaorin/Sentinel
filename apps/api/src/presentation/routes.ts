import { Router } from "express";
import health from "./health/health.route.js";
import multisig from "./multisigs/multisig.route.js";

const router: Router = Router();

router.use("/", health);
router.use("/", multisig);

export default router;

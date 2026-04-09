import { Router } from "express";
import health from "./health/health.route.js";

const router: Router = Router();

router.use("/", health);

export default router;

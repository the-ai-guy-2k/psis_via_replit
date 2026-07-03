import { Router, type IRouter } from "express";
import healthRouter from "./health";
import entriesRouter from "./entries";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(entriesRouter);
router.use(dashboardRouter);

export default router;

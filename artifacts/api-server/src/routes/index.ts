import { Router, type IRouter } from "express";
import healthRouter from "./health";
import entriesRouter from "./entries";
import dashboardRouter from "./dashboard";
import inningsRouter from "./innings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(entriesRouter);
router.use(dashboardRouter);
router.use(inningsRouter);

export default router;

import { Router, type IRouter } from "express";
import { GetCurrentInningResponse } from "@workspace/api-zod";
import { listEntries, computeLatestInningState } from "../lib/psisStore";

const router: IRouter = Router();

router.get("/innings/current", async (req, res): Promise<void> => {
  const entries = await listEntries();
  const inningState = computeLatestInningState(entries);
  req.log.info({ inningNumber: inningState.inningNumber, outs: inningState.outs }, "Computed current inning state");
  res.json(GetCurrentInningResponse.parse(inningState));
});

export default router;

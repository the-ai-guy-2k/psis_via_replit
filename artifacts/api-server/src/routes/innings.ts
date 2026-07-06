import { Router, type IRouter } from "express";
import { GetCurrentInningResponse } from "@workspace/api-zod";
import { listEntries, computeLatestInningState, getCurrentGameId } from "../lib/psisStore";

const router: IRouter = Router();

router.get("/innings/current", async (req, res): Promise<void> => {
  const entries = await listEntries();
  const gameId = await getCurrentGameId();
  const inningState = computeLatestInningState(entries, gameId);
  req.log.info({ inningNumber: inningState.inningNumber, outs: inningState.outs, gameId }, "Computed current inning state");
  res.json(GetCurrentInningResponse.parse(inningState));
});

export default router;

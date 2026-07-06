import { Router, type IRouter } from "express";
import { StartNewGameResponse } from "@workspace/api-zod";
import { startNewGame } from "../lib/psisStore";

const router: IRouter = Router();

router.post("/games/new", async (req, res): Promise<void> => {
  const gameId = await startNewGame();
  req.log.info({ gameId }, "Started new PSIS game");
  res.json(StartNewGameResponse.parse({ gameId }));
});

export default router;

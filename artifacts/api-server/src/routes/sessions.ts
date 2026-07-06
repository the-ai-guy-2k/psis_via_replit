import { randomUUID } from "crypto";
import { Router, type IRouter } from "express";
import { EndSessionResponse, ListSessionsResponse } from "@workspace/api-zod";
import { listEntries, listSessions, appendSession, getCurrentGameId, startNewGame, computeSessionSummary } from "../lib/psisStore";

const router: IRouter = Router();

router.get("/sessions", async (req, res): Promise<void> => {
  const sessions = await listSessions();
  req.log.info({ count: sessions.length }, "Listed PSIS sessions");
  res.json(ListSessionsResponse.parse(sessions));
});

// Ends the active pitching session: requires at least 1 completed inning
// (not a fixed 9), computes + persists a session summary from the current
// game's at-bats, then bumps the game boundary (same mechanism as "New
// Game") so the Tracker's live view resets — historical entries are never
// deleted or mutated.
router.post("/sessions/end", async (req, res): Promise<void> => {
  const gameId = await getCurrentGameId();
  const entries = await listEntries();
  const summary = computeSessionSummary(entries, gameId, randomUUID(), new Date().toISOString());

  if (summary.inningsCompleted < 1) {
    req.log.warn({ gameId }, "Rejected End Session: no completed innings yet");
    res.status(400).json({ message: "A session must include at least 1 completed inning before it can be ended." });
    return;
  }

  await appendSession(summary);
  const newGameId = await startNewGame();
  req.log.info({ sessionId: summary.sessionId, gameId, newGameId }, "Ended PSIS session");
  res.status(201).json(EndSessionResponse.parse({ session: summary, newGameId }));
});

export default router;

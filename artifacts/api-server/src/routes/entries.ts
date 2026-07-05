import { randomUUID } from "crypto";
import { Router, type IRouter } from "express";
import {
  CreateEntryBody,
  UpdateEntryBody,
  ListEntriesResponse,
  CreateEntryResponse,
  UpdateEntryResponse,
} from "@workspace/api-zod";
import {
  appendEntry,
  listEntries,
  updateEntry,
  computeInningState,
  resultCategoryForOutcomeCategory,
  rawOutsForOutcome,
  resolveInningForNewAtBat,
} from "../lib/psisStore";

const router: IRouter = Router();

router.get("/entries", async (req, res): Promise<void> => {
  const entries = await listEntries();
  req.log.info({ count: entries.length }, "Listed PSIS entries");
  res.json(ListEntriesResponse.parse(entries));
});

router.post("/entries", async (req, res): Promise<void> => {
  const parsed = CreateEntryBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid entry payload");
    res.status(400).json({ message: parsed.error.message });
    return;
  }

  const input = parsed.data;

  if (input.outcomeType === "extra_base_hit" && !input.outcomeDetail) {
    res.status(400).json({ message: "outcomeDetail (double or triple) is required for extra_base_hit" });
    return;
  }

  if (input.outcomeDetail && input.outcomeType !== "extra_base_hit") {
    res.status(400).json({ message: "outcomeDetail is only valid for extra_base_hit" });
    return;
  }

  if (input.outcomeType === "run_scored" && input.runsScored === undefined) {
    res.status(400).json({ message: "runsScored is required for run_scored" });
    return;
  }

  if (input.runsScored !== undefined && input.outcomeType !== "run_scored") {
    res.status(400).json({ message: "runsScored is only valid for run_scored" });
    return;
  }

  // run_scored is tracked separately from the good/bad tally (and its own
  // "Runs Scored" bucket) so the inning delta formula (good - bad - runs)
  // does not double count it.
  const isRunScored = input.outcomeType === "run_scored";
  const resultCategory = resultCategoryForOutcomeCategory(input.outcomeCategory);
  const goodCount = !isRunScored && resultCategory === "good" ? 1 : 0;
  const badCount = !isRunScored && resultCategory === "bad" ? 1 : 0;
  const strikeoutCount = input.outcomeType === "strikeout" ? 1 : 0;
  const delta = isRunScored ? -input.runsScored! : goodCount - badCount;

  const existingEntries = await listEntries();
  const { inningNumber, currentOuts } = resolveInningForNewAtBat(existingEntries);

  const rawOuts = rawOutsForOutcome(input.outcomeCategory, input.outcomeType);
  const outsAdded = Math.min(rawOuts, 3 - currentOuts);

  const entry = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    resultCategory,
    goodCount,
    badCount,
    strikeoutCount,
    delta,
    inningNumber,
    outsAdded,
  };

  await appendEntry(entry);
  req.log.info({ id: entry.id }, "Created PSIS entry");
  res.status(201).json(CreateEntryResponse.parse(entry));
});

router.patch("/entries/:id", async (req, res): Promise<void> => {
  const parsed = UpdateEntryBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid entry update payload");
    res.status(400).json({ message: parsed.error.message });
    return;
  }

  const entries = await listEntries();
  const target = entries.find(e => e.id === req.params.id);
  if (!target) {
    res.status(404).json({ message: "Entry not found" });
    return;
  }

  if (target.inningNumber === undefined) {
    res.status(400).json({ message: "Entry predates inning tracking and cannot record playersLeftOnBase" });
    return;
  }

  const inningState = computeInningState(entries, target.inningNumber);
  const isLastAtBatOfInning = inningState.atBats[inningState.atBats.length - 1]?.id === target.id;
  if (!inningState.completed || !isLastAtBatOfInning) {
    res.status(400).json({
      message: "playersLeftOnBase can only be recorded on the at-bat that completed a 3-out inning",
    });
    return;
  }

  const updated = await updateEntry(req.params.id, { playersLeftOnBase: parsed.data.playersLeftOnBase });
  if (!updated) {
    res.status(404).json({ message: "Entry not found" });
    return;
  }

  req.log.info({ id: updated.id }, "Updated PSIS entry with playersLeftOnBase");
  res.status(200).json(UpdateEntryResponse.parse(updated));
});

export default router;

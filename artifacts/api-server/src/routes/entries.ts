import { randomUUID } from "crypto";
import { Router, type IRouter } from "express";
import {
  CreateEntryBody,
  ListEntriesResponse,
  CreateEntryResponse,
} from "@workspace/api-zod";
import type { OutcomeType, OutcomeDetail } from "@workspace/api-zod";
import {
  appendEntry,
  listEntries,
  resultCategoryForOutcomeCategory,
  rawOutsForOutcome,
  resolveInningForNewAtBat,
  applyOutcomeToBaseState,
  getCurrentGameId,
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

  // Follow-up detail question per outcome type in the EABR progressive click
  // flow: ground_out asks the play result, fly_out asks the catch location,
  // hit asks the hit type. extra_base_hit is kept for backward compatibility
  // with entries created before ground_out/hit branching existed.
  const VALID_DETAILS_BY_TYPE: Partial<Record<OutcomeType, OutcomeDetail[]>> = {
    ground_out: ["single_play", "double_play", "triple_play"],
    fly_out: ["infield", "outfield"],
    hit: ["single", "double", "triple", "home_run"],
    extra_base_hit: ["double", "triple"],
  };

  const allowedDetails = VALID_DETAILS_BY_TYPE[input.outcomeType];
  if (allowedDetails) {
    if (!input.outcomeDetail || !allowedDetails.includes(input.outcomeDetail)) {
      res.status(400).json({
        message: `outcomeDetail is required for ${input.outcomeType} (one of: ${allowedDetails.join(", ")})`,
      });
      return;
    }
  } else if (input.outcomeDetail) {
    res.status(400).json({ message: `outcomeDetail is not valid for outcomeType ${input.outcomeType}` });
    return;
  }

  // run_scored is a legacy manual-override outcomeType that predates
  // base-state tracking; it's tracked separately from the good/bad tally
  // (and kept out of goodCount/badCount) so the inning delta formula
  // (good - bad - runs) does not double count it. New entries never
  // produce it — hit/walk now compute their own runsScored automatically.
  const isRunScored = input.outcomeType === "run_scored";

  if (isRunScored && input.runsScored === undefined) {
    res.status(400).json({ message: "runsScored is required for run_scored" });
    return;
  }

  if (input.runsScored !== undefined && !isRunScored) {
    res.status(400).json({
      message: "runsScored is computed automatically from base-state advancement and must not be supplied by the client",
    });
    return;
  }

  const resultCategory = resultCategoryForOutcomeCategory(input.outcomeCategory);
  // Official EABR unit rule: each qualifying event is worth exactly 1 unit,
  // regardless of play detail (a ground_out/double_play or /triple_play is
  // still only 1 good unit; a double/triple/home_run hit is still only 1 bad
  // unit). Play detail is stored (outcomeDetail) but never multiplies units.
  const baseGoodCount = !isRunScored && resultCategory === "good" ? 1 : 0;
  const badCount = !isRunScored && resultCategory === "bad" ? 1 : 0;
  const strikeoutCount = input.outcomeType === "strikeout" ? 1 : 0;

  const existingEntries = await listEntries();
  const gameId = await getCurrentGameId();
  const { inningNumber, currentOuts, baseState: baseStateBeforeAtBat } = resolveInningForNewAtBat(existingEntries, gameId);

  const { baseState: baseStateAfterAtBat, runsScored } = isRunScored
    ? { baseState: baseStateBeforeAtBat, runsScored: input.runsScored! }
    : applyOutcomeToBaseState(input.outcomeCategory, input.outcomeType, input.outcomeDetail, baseStateBeforeAtBat);

  const rawOuts = rawOutsForOutcome(input.outcomeCategory, input.outcomeType, input.outcomeDetail);
  const outsAdded = Math.min(rawOuts, 3 - currentOuts);

  // Players left on base are auto-calculated from base occupancy the
  // instant the 3rd out is recorded — no manual entry or follow-up PATCH
  // needed. Defensive outs never move runners, so baseStateAfterAtBat here
  // equals the pre-at-bat occupancy for the completing out.
  const inningJustCompleted = currentOuts + outsAdded >= 3;
  const playersLeftOnBase = inningJustCompleted
    ? [baseStateAfterAtBat.firstBase, baseStateAfterAtBat.secondBase, baseStateAfterAtBat.thirdBase].filter(Boolean).length
    : undefined;

  // Official EABR rule: each player left on base at inning-completion is
  // worth 1 additional good unit, folded into this completing entry's
  // goodCount (see "neutralize-and-bake-in" pattern — keeps computeInningState's
  // sum(entry.goodCount) correct with no separate LOB-units aggregation).
  const goodCount = baseGoodCount + (playersLeftOnBase ?? 0);

  // Official EABR Delta = Good Units - Bad Units. Runs scored are still
  // computed/stored (see runsScored above) but are no longer subtracted.
  const delta = goodCount - badCount;

  const entry = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    resultCategory,
    goodCount,
    badCount,
    strikeoutCount,
    delta,
    runsScored,
    baseState: baseStateAfterAtBat,
    inningNumber,
    gameId,
    outsAdded,
    playersLeftOnBase,
  };

  await appendEntry(entry);
  req.log.info({ id: entry.id }, "Created PSIS entry");
  res.status(201).json(CreateEntryResponse.parse(entry));
});

export default router;

import { randomUUID } from "crypto";
import { Router, type IRouter } from "express";
import {
  CreateEntryBody,
  ListEntriesResponse,
  CreateEntryResponse,
} from "@workspace/api-zod";
import { appendEntry, listEntries, resultCategoryForOutcomeCategory } from "../lib/psisStore";

const router: IRouter = Router();

const LEFT_ON_BASE_ELIGIBLE = new Set([
  "ground_out",
  "fly_out",
  "double_play",
  "triple_play",
]);

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

  if (
    input.playersLeftOnBase !== undefined &&
    !(input.outcomeCategory === "defense" && LEFT_ON_BASE_ELIGIBLE.has(input.outcomeType))
  ) {
    res.status(400).json({
      message: "playersLeftOnBase is only valid for ground_out, fly_out, double_play, or triple_play",
    });
    return;
  }

  const resultCategory = resultCategoryForOutcomeCategory(input.outcomeCategory);
  const goodCount = resultCategory === "good" ? 1 : 0;
  const badCount = resultCategory === "bad" ? 1 : 0;
  const strikeoutCount = input.outcomeType === "strikeout" ? 1 : 0;

  const entry = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    resultCategory,
    goodCount,
    badCount,
    strikeoutCount,
    delta: goodCount - badCount,
  };

  await appendEntry(entry);
  req.log.info({ id: entry.id }, "Created PSIS entry");
  res.status(201).json(CreateEntryResponse.parse(entry));
});

export default router;

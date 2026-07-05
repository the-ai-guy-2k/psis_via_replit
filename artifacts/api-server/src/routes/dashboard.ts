import { Router, type IRouter } from "express";
import type { Entry, SequenceStat } from "@workspace/api-zod";
import { GetDashboardResponse } from "@workspace/api-zod";
import { listEntries } from "../lib/psisStore";

const router: IRouter = Router();

function computeSequenceStats(entries: Entry[]): SequenceStat[] {
  const bySequence = new Map<string, { totalDelta: number; occurrences: number }>();

  for (const entry of entries) {
    if (!entry.pitchSequence) {
      continue;
    }
    const existing = bySequence.get(entry.pitchSequence) ?? {
      totalDelta: 0,
      occurrences: 0,
    };
    existing.totalDelta += entry.delta;
    existing.occurrences += 1;
    bySequence.set(entry.pitchSequence, existing);
  }

  return Array.from(bySequence.entries()).map(([pitchSequence, stats]) => ({
    pitchSequence,
    totalDelta: stats.totalDelta,
    averageDelta: stats.totalDelta / stats.occurrences,
    occurrences: stats.occurrences,
  }));
}

router.get("/dashboard", async (req, res): Promise<void> => {
  const entries = await listEntries();

  const totalGood = entries.reduce((sum, e) => sum + e.goodCount, 0);
  const totalBad = entries.reduce((sum, e) => sum + e.badCount, 0);
  const totalStrikeouts = entries.reduce((sum, e) => sum + e.strikeoutCount, 0);
  const averageDelta =
    entries.length > 0
      ? entries.reduce((sum, e) => sum + e.delta, 0) / entries.length
      : 0;

  const sequenceStats = computeSequenceStats(entries);
  const bestSequences = [...sequenceStats]
    .sort((a, b) => b.averageDelta - a.averageDelta)
    .slice(0, 5);
  const worstSequences = [...sequenceStats]
    .sort((a, b) => a.averageDelta - b.averageDelta)
    .slice(0, 5);

  const summary = {
    recentEntries: entries.slice(0, 10),
    bestSequences,
    worstSequences,
    totalGood,
    totalBad,
    totalStrikeouts,
    averageDelta,
    entryCount: entries.length,
  };

  req.log.info({ entryCount: entries.length }, "Computed PSIS dashboard summary");
  res.json(GetDashboardResponse.parse(summary));
});

export default router;

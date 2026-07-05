import { promises as fs } from "fs";
import path from "path";
import type { Entry, ResultOutcome, OutcomeCategory, OutcomeType } from "@workspace/api-zod";
import { logger } from "./logger";

const GOOD_RESULTS: ResultOutcome[] = [
  "strikeout",
  "ground_out",
  "fly_out",
  "pop_out",
  "double_play",
  "weak_contact",
];

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const dataDir = path.resolve(workspaceRoot, "artifacts/api-server/data");
const dataFile = path.resolve(dataDir, "psis_entries.json");

export function resultCategoryFor(result: ResultOutcome): "good" | "bad" {
  return GOOD_RESULTS.includes(result) ? "good" : "bad";
}

export function resultCategoryForOutcomeCategory(outcomeCategory: OutcomeCategory): "good" | "bad" {
  return outcomeCategory === "defense" ? "good" : "bad";
}

const OUTS_BY_DEFENSE_OUTCOME: Partial<Record<OutcomeType, number>> = {
  strikeout: 1,
  fly_out: 1,
  ground_out: 1,
  infield_catch: 1,
  double_play: 2,
  triple_play: 3,
};

export function rawOutsForOutcome(outcomeCategory: OutcomeCategory, outcomeType: OutcomeType): number {
  if (outcomeCategory !== "defense") return 0;
  return OUTS_BY_DEFENSE_OUTCOME[outcomeType] ?? 0;
}

export interface InningState {
  inningNumber: number;
  outs: number;
  completed: boolean;
  totalAtBats: number;
  goodCount: number;
  badCount: number;
  inningDelta: number;
  runsScored: number;
  playersLeftOnBase: number;
  atBats: Entry[];
}

function emptyInningState(inningNumber: number): InningState {
  return {
    inningNumber,
    outs: 0,
    completed: false,
    totalAtBats: 0,
    goodCount: 0,
    badCount: 0,
    inningDelta: 0,
    runsScored: 0,
    playersLeftOnBase: 0,
    atBats: [],
  };
}

/**
 * Returns the state of a specific inning, computed from stored entries — no
 * separate "current inning" record is persisted.
 */
export function computeInningState(entries: Entry[], inningNumber: number): InningState {
  const atBats = entries
    .filter((e): e is Entry & { inningNumber: number } => e.inningNumber === inningNumber)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (atBats.length === 0) return emptyInningState(inningNumber);

  const outs = atBats.reduce((sum, e) => sum + (e.outsAdded ?? 0), 0);

  return {
    inningNumber,
    outs,
    completed: outs >= 3,
    totalAtBats: atBats.length,
    goodCount: atBats.reduce((sum, e) => sum + e.goodCount, 0),
    badCount: atBats.reduce((sum, e) => sum + e.badCount, 0),
    inningDelta: atBats.reduce((sum, e) => sum + e.delta, 0),
    runsScored: atBats.reduce((sum, e) => sum + (e.outcomeType === "run_scored" ? (e.runsScored ?? 1) : 0), 0),
    playersLeftOnBase: atBats.reduce((sum, e) => sum + (e.playersLeftOnBase ?? 0), 0),
    atBats,
  };
}

/**
 * Derives the state of the most recently played inning, for display —
 * including once it reaches 3 outs and is complete. Entries created before
 * inning tracking existed (no `inningNumber`) are ignored, so a fresh inning
 * 1 starts once the first inning-tracked at-bat is logged.
 */
export function computeLatestInningState(entries: Entry[]): InningState {
  const trackedInningNumbers = entries
    .filter((e): e is Entry & { inningNumber: number } => e.inningNumber !== undefined)
    .map(e => e.inningNumber);

  if (trackedInningNumbers.length === 0) return emptyInningState(1);

  const latestInningNumber = Math.max(...trackedInningNumbers);
  return computeInningState(entries, latestInningNumber);
}

/**
 * Resolves which inning (and current out count) a new at-bat should be
 * recorded against, auto-advancing past a just-completed inning.
 */
export function resolveInningForNewAtBat(entries: Entry[]): { inningNumber: number; currentOuts: number } {
  const latest = computeLatestInningState(entries);
  return latest.completed
    ? { inningNumber: latest.inningNumber + 1, currentOuts: 0 }
    : { inningNumber: latest.inningNumber, currentOuts: latest.outs };
}

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]\n", "utf-8");
  }
}

async function readEntries(): Promise<Entry[]> {
  await ensureDataFile();
  const raw = await fs.readFile(dataFile, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Entry[]) : [];
  } catch (err) {
    logger.error({ err }, "Failed to parse psis_entries.json, treating as empty");
    return [];
  }
}

async function writeEntries(entries: Entry[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(dataFile, JSON.stringify(entries, null, 2) + "\n", "utf-8");
}

export async function listEntries(): Promise<Entry[]> {
  const entries = await readEntries();
  return [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function appendEntry(entry: Entry): Promise<Entry> {
  const entries = await readEntries();
  entries.push(entry);
  await writeEntries(entries);
  return entry;
}

export async function updateEntry(id: string, patch: Partial<Pick<Entry, "playersLeftOnBase">>): Promise<Entry | undefined> {
  const entries = await readEntries();
  const index = entries.findIndex(e => e.id === id);
  if (index === -1) return undefined;

  const updated = { ...entries[index], ...patch };
  entries[index] = updated;
  await writeEntries(entries);
  return updated;
}

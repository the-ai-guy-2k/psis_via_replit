import { promises as fs } from "fs";
import path from "path";
import type { Entry } from "@workspace/api-zod";
import { logger } from "./logger";

/**
 * All pure game-logic calculations (outs, base-state/run advancement,
 * inning aggregation, gameId scoping) live in @workspace/psis-game-logic so
 * they can be imported unduplicated by both this server and the standalone
 * scenario test script (scripts/src/test-psis-scenarios.ts). This file only
 * owns file I/O (reading/writing the JSON data files) and re-exports the
 * pure functions for route handlers that already import them from here.
 */
export {
  resultCategoryFor,
  resultCategoryForOutcomeCategory,
  rawOutsForOutcome,
  emptyBaseState,
  isEntryInGame,
  applyOutcomeToBaseState,
  computeInningState,
  computeLatestInningState,
  resolveInningForNewAtBat,
  type InningState,
} from "@workspace/psis-game-logic";

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const dataDir = path.resolve(workspaceRoot, "artifacts/api-server/data");
const dataFile = path.resolve(dataDir, "psis_entries.json");
const gameStateFile = path.resolve(dataDir, "psis_game_state.json");

interface GameStateFile {
  currentGameId: number;
}

async function ensureGameStateFile(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(gameStateFile);
  } catch {
    await fs.writeFile(gameStateFile, JSON.stringify({ currentGameId: 1 }, null, 2) + "\n", "utf-8");
  }
}

/**
 * The current "game" boundary (bumped by New Game). Entries created before
 * this concept existed have no `gameId` and are treated as belonging to
 * game 1 (see `isEntryInGame`), so pre-existing data keeps showing normally
 * until the first New Game click. Only the Tracker's live view is scoped by
 * this — the season Dashboard intentionally ignores it and reads all
 * entries across every game.
 */
export async function getCurrentGameId(): Promise<number> {
  await ensureGameStateFile();
  try {
    const raw = await fs.readFile(gameStateFile, "utf-8");
    const parsed = JSON.parse(raw) as GameStateFile;
    return typeof parsed.currentGameId === "number" ? parsed.currentGameId : 1;
  } catch (err) {
    logger.error({ err }, "Failed to parse psis_game_state.json, defaulting to gameId 1");
    return 1;
  }
}

/**
 * Starts a brand-new game by bumping the persisted game boundary. Does not
 * touch `psis_entries.json` — historical at-bats stay intact for the season
 * Dashboard, they just fall outside the new `currentGameId` so the Tracker's
 * live view (inning/outs/delta/bases/completed innings) reads as empty.
 */
export async function startNewGame(): Promise<number> {
  const currentGameId = await getCurrentGameId();
  const nextGameId = currentGameId + 1;
  await fs.writeFile(gameStateFile, JSON.stringify({ currentGameId: nextGameId }, null, 2) + "\n", "utf-8");
  return nextGameId;
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

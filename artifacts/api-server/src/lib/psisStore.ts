import { promises as fs } from "fs";
import path from "path";
import type { Entry, ResultOutcome } from "@workspace/api-zod";
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

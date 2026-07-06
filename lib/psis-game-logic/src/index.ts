import type { Entry, ResultOutcome, OutcomeCategory, OutcomeType, OutcomeDetail, BaseState } from "@workspace/api-zod";

/**
 * This module is the single source of truth for PSIS's pure game-logic
 * calculations (outs, base-state/run advancement, inning aggregation, and
 * gameId scoping). It has no file I/O and no Express dependency, so it can
 * be imported both by the API server (`artifacts/api-server`) and by
 * standalone scenario tests (`scripts/src/test-psis-scenarios.ts`) without
 * duplicating any of the actual rules.
 */

const GOOD_RESULTS: ResultOutcome[] = [
  "strikeout",
  "ground_out",
  "fly_out",
  "pop_out",
  "double_play",
  "weak_contact",
];

export function resultCategoryFor(result: ResultOutcome): "good" | "bad" {
  return GOOD_RESULTS.includes(result) ? "good" : "bad";
}

export function resultCategoryForOutcomeCategory(outcomeCategory: OutcomeCategory): "good" | "bad" {
  return outcomeCategory === "defense" ? "good" : "bad";
}

// Flat outs mapping for outcome types that don't branch further (or whose
// legacy top-level value predates the ground_out -> outcomeDetail branch).
const OUTS_BY_DEFENSE_OUTCOME: Partial<Record<OutcomeType, number>> = {
  strikeout: 1,
  fly_out: 1,
  infield_out: 1,
  infield_catch: 1, // legacy alias for infield_out
  double_play: 2, // legacy top-level value, predates ground_out branching
  triple_play: 3, // legacy top-level value, predates ground_out branching
};

// Outs for a ground_out depend on its outcomeDetail (the EABR click flow's
// "play result" question), not a flat per-type value.
const OUTS_BY_GROUND_OUT_DETAIL: Partial<Record<OutcomeDetail, number>> = {
  single_play: 1,
  double_play: 2,
  triple_play: 3,
};

export function rawOutsForOutcome(
  outcomeCategory: OutcomeCategory,
  outcomeType: OutcomeType,
  outcomeDetail?: OutcomeDetail,
): number {
  if (outcomeCategory !== "defense") return 0;
  if (outcomeType === "ground_out") {
    return (outcomeDetail && OUTS_BY_GROUND_OUT_DETAIL[outcomeDetail]) ?? 1;
  }
  return OUTS_BY_DEFENSE_OUTCOME[outcomeType] ?? 0;
}

export interface InningState {
  inningNumber: number;
  gameId: number;
  outs: number;
  completed: boolean;
  totalAtBats: number;
  goodCount: number;
  badCount: number;
  inningDelta: number;
  runsScored: number;
  playersLeftOnBase: number;
  baseState: BaseState;
  atBats: Entry[];
}

export function isEntryInGame(entry: Pick<Entry, "gameId">, gameId: number): boolean {
  return (entry.gameId ?? 1) === gameId;
}

export function emptyBaseState(): BaseState {
  return { firstBase: false, secondBase: false, thirdBase: false };
}

function emptyInningState(inningNumber: number, gameId: number): InningState {
  return {
    inningNumber,
    gameId,
    outs: 0,
    completed: false,
    totalAtBats: 0,
    goodCount: 0,
    badCount: 0,
    inningDelta: 0,
    runsScored: 0,
    playersLeftOnBase: 0,
    baseState: emptyBaseState(),
    atBats: [],
  };
}

/**
 * Forced-advancement walk logic (MVP): the batter always takes first. A
 * runner is only pushed to the next base if the base behind them is
 * occupied, exactly mirroring real force-play rules without any
 * steal/tag-up logic. A run is forced home only when the bases were loaded.
 */
function applyWalk(bases: BaseState): { baseState: BaseState; runsScored: number } {
  const { firstBase, secondBase, thirdBase } = bases;
  let runsScored = 0;
  let newSecond = secondBase;
  let newThird = thirdBase;

  if (firstBase) {
    if (secondBase) {
      if (thirdBase) runsScored += 1;
      newThird = true;
    }
    newSecond = true;
  }

  return { baseState: { firstBase: true, secondBase: newSecond, thirdBase: newThird }, runsScored };
}

// How many bases the batter (and every existing runner) advances for each
// hit type. home_run is included here since a 4-base advance naturally
// clears the bases and scores every runner plus the batter.
const HIT_ADVANCE_BASES: Partial<Record<OutcomeDetail, number>> = {
  single: 1,
  double: 2,
  triple: 3,
  home_run: 4,
};

/**
 * Advances every existing runner (and the batter, starting at "base 0")
 * by `advance` bases. Anyone pushed to base 4+ has scored. This is the MVP
 * simplification used for all hit types — no fielder's choice, no
 * situational holding a runner at a base.
 */
function advanceRunners(bases: BaseState, advance: number): { baseState: BaseState; runsScored: number } {
  const occupiedBases = [0, ...(bases.firstBase ? [1] : []), ...(bases.secondBase ? [2] : []), ...(bases.thirdBase ? [3] : [])];

  let runsScored = 0;
  const newBaseState = emptyBaseState();
  for (const base of occupiedBases) {
    const newPosition = base + advance;
    if (newPosition >= 4) runsScored += 1;
    else if (newPosition === 1) newBaseState.firstBase = true;
    else if (newPosition === 2) newBaseState.secondBase = true;
    else if (newPosition === 3) newBaseState.thirdBase = true;
  }

  return { baseState: newBaseState, runsScored };
}

/**
 * Applies an at-bat's outcome to the current base state, returning the
 * resulting occupancy and runs scored on this at-bat. Defensive outcomes
 * (outs) never move runners in this MVP model (no fielder's choice, no
 * tag-up/sac logic). The legacy `run_scored` outcomeType predates
 * base-state tracking and is left untouched here — its runsScored is
 * supplied manually by the caller instead.
 */
export function applyOutcomeToBaseState(
  outcomeCategory: OutcomeCategory,
  outcomeType: OutcomeType,
  outcomeDetail: OutcomeDetail | undefined,
  baseState: BaseState,
): { baseState: BaseState; runsScored: number } {
  if (outcomeCategory !== "offense") return { baseState, runsScored: 0 };
  if (outcomeType === "walk") return applyWalk(baseState);
  if (outcomeType === "hit") {
    const advance = (outcomeDetail && HIT_ADVANCE_BASES[outcomeDetail]) ?? 1;
    return advanceRunners(baseState, advance);
  }
  // Legacy offense outcomes (run_scored, extra_base_hit, home_run as a
  // top-level value) predate base-state tracking — leave bases untouched.
  return { baseState, runsScored: 0 };
}

/**
 * Returns the state of a specific inning, computed from stored entries — no
 * separate "current inning" record is persisted.
 */
export function computeInningState(entries: Entry[], inningNumber: number, gameId: number): InningState {
  const atBats = entries
    .filter((e): e is Entry & { inningNumber: number } => e.inningNumber === inningNumber && isEntryInGame(e, gameId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (atBats.length === 0) return emptyInningState(inningNumber, gameId);

  const outs = atBats.reduce((sum, e) => sum + (e.outsAdded ?? 0), 0);

  return {
    inningNumber,
    gameId,
    outs,
    completed: outs >= 3,
    totalAtBats: atBats.length,
    goodCount: atBats.reduce((sum, e) => sum + e.goodCount, 0),
    badCount: atBats.reduce((sum, e) => sum + e.badCount, 0),
    inningDelta: atBats.reduce((sum, e) => sum + e.delta, 0),
    runsScored: atBats.reduce((sum, e) => sum + (e.runsScored ?? 0), 0),
    playersLeftOnBase: atBats.reduce((sum, e) => sum + (e.playersLeftOnBase ?? 0), 0),
    baseState: atBats[atBats.length - 1]?.baseState ?? emptyBaseState(),
    atBats,
  };
}

/**
 * Derives the state of the most recently played inning, for display —
 * including once it reaches 3 outs and is complete. Entries created before
 * inning tracking existed (no `inningNumber`) are ignored, so a fresh inning
 * 1 starts once the first inning-tracked at-bat is logged.
 */
export function computeLatestInningState(entries: Entry[], gameId: number): InningState {
  const trackedInningNumbers = entries
    .filter((e): e is Entry & { inningNumber: number } => e.inningNumber !== undefined && isEntryInGame(e, gameId))
    .map(e => e.inningNumber);

  if (trackedInningNumbers.length === 0) return emptyInningState(1, gameId);

  const latestInningNumber = Math.max(...trackedInningNumbers);
  return computeInningState(entries, latestInningNumber, gameId);
}

/**
 * Resolves which inning (and current out count / base state) a new at-bat
 * should be recorded against, auto-advancing past a just-completed inning.
 * Base state resets to empty at the start of a new inning. Only considers
 * entries belonging to the current game (see isEntryInGame) so a New Game
 * always restarts numbering at inning 1 with empty bases, regardless of how
 * far a previous game got.
 */
export function resolveInningForNewAtBat(
  entries: Entry[],
  gameId: number,
): { inningNumber: number; currentOuts: number; baseState: BaseState } {
  const latest = computeLatestInningState(entries, gameId);
  return latest.completed
    ? { inningNumber: latest.inningNumber + 1, currentOuts: 0, baseState: emptyBaseState() }
    : { inningNumber: latest.inningNumber, currentOuts: latest.outs, baseState: latest.baseState };
}

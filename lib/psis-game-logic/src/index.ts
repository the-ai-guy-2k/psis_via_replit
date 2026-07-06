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

/**
 * RBI for a single at-bat, per the ACI live-testing-feedback patch: RBI is
 * simply the runs this at-bat drove in via base-state advancement
 * (runsScored), since defensive outcomes never advance runners and thus
 * always compute runsScored = 0 already. The legacy manual `run_scored`
 * override predates base-state tracking and is intentionally excluded (its
 * own good/bad units are already neutralized to 0 — see computeEabrUnits —
 * so it must not also contribute an RBI bad-unit penalty).
 */
export function computeRbi(runsScored: number, isLegacyManualOverride: boolean): number {
  return isLegacyManualOverride ? 0 : runsScored;
}

export interface EabrUnitsInput {
  resultCategory: "good" | "bad";
  /** True only for the legacy `run_scored` outcomeType, which predates the EABR unit system entirely. */
  isLegacyManualOverride: boolean;
  /** Only set on the at-bat that records an inning's 3rd out. */
  playersLeftOnBase?: number;
  /** RBI driven in on this at-bat (see computeRbi) — each RBI is an extra bad unit. */
  rbi: number;
}

export interface EabrUnits {
  goodCount: number;
  badCount: number;
  delta: number;
}

/**
 * The single source of truth for EABR good/bad unit + delta computation,
 * shared by the API server (entries.ts) and the scenario test script so the
 * rule can never drift between the two call sites.
 *
 * Official EABR rules (ACI live-testing-feedback patch):
 * - 1 base good unit for a good (defense) outcome, plus 1 extra good unit
 *   per player left on base if this at-bat completed the inning (LOB is
 *   folded directly into goodCount, never tracked as a separate field).
 * - 1 base bad unit for a bad (offense) outcome, PLUS 1 additional bad unit
 *   per RBI driven in on this at-bat (badCount = baseBadCount + rbi). RBI is
 *   already runsScored-derived, so this does not double-subtract runsScored
 *   anywhere else — runsScored is only ever stored/displayed, never itself
 *   subtracted from delta.
 * - The legacy `run_scored` manual-override outcomeType is neutralized to
 *   0/0/0 entirely (both units and RBI), matching its pre-existing
 *   backward-compatibility treatment.
 * - Delta = goodCount - badCount.
 */
export function computeEabrUnits(input: EabrUnitsInput): EabrUnits {
  if (input.isLegacyManualOverride) {
    return { goodCount: 0, badCount: 0, delta: 0 };
  }
  const baseGoodCount = input.resultCategory === "good" ? 1 : 0;
  const baseBadCount = input.resultCategory === "bad" ? 1 : 0;
  const goodCount = baseGoodCount + (input.playersLeftOnBase ?? 0);
  const badCount = baseBadCount + input.rbi;
  return { goodCount, badCount, delta: goodCount - badCount };
}

export interface Session {
  sessionId: string;
  endedAt: string;
  gameId: number;
  inningsCompleted: number;
  /** The inning number that was still in progress (not yet 3 outs) when the session ended, if any. */
  currentInning?: number;
  totalOutsRecorded: number;
  totalGoodUnits: number;
  totalBadUnits: number;
  /** Good units / Bad units. null when totalBadUnits is 0 (undefined ratio). */
  sessionEabrFraction: number | null;
  sessionEabrDelta: number;
  totalHitsAllowed: number;
  totalWalksAllowed: number;
  totalHomeRunsAllowed: number;
  totalExtraBaseHitsAllowed: number;
  totalRBIAllowed: number;
  totalRunsAllowed: number;
  totalStrikeouts: number;
  totalFlyOuts: number;
  totalGroundOuts: number;
  totalLOB: number;
  inningSummaries: InningState[];
  atBats: Entry[];
}

/**
 * Aggregates every at-bat belonging to `gameId` into a persistable session
 * summary for the "End Session" flow. Pure/no I/O so both the API server and
 * the scenario test script can exercise the exact same logic. Does not
 * enforce the "at least 1 completed inning" business rule itself — callers
 * (the /sessions/end route, or a test asserting on it) check
 * `inningsCompleted` and decide whether to persist/reject.
 */
export function computeSessionSummary(entries: Entry[], gameId: number, sessionId: string, endedAt: string): Session {
  const atBats = entries
    .filter(e => isEntryInGame(e, gameId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const inningNumbers = Array.from(
    new Set(atBats.filter((e): e is Entry & { inningNumber: number } => e.inningNumber !== undefined).map(e => e.inningNumber)),
  ).sort((a, b) => a - b);

  const inningSummaries = inningNumbers.map(n => computeInningState(entries, n, gameId));
  const inningsCompleted = inningSummaries.filter(i => i.completed).length;
  const lastInning = inningSummaries[inningSummaries.length - 1];
  const currentInning = lastInning && !lastInning.completed ? lastInning.inningNumber : undefined;

  const totalOutsRecorded = atBats.reduce((sum, e) => sum + (e.outsAdded ?? 0), 0);
  const totalGoodUnits = atBats.reduce((sum, e) => sum + e.goodCount, 0);
  const totalBadUnits = atBats.reduce((sum, e) => sum + e.badCount, 0);
  const totalRBIAllowed = atBats.reduce((sum, e) => sum + (e.rbi ?? 0), 0);
  const totalRunsAllowed = atBats.reduce((sum, e) => sum + (e.runsScored ?? 0), 0);
  const totalLOB = atBats.reduce((sum, e) => sum + (e.playersLeftOnBase ?? 0), 0);

  const isHitWithDetail = (e: Entry, detail: OutcomeDetail) => e.outcomeType === "hit" && e.outcomeDetail === detail;

  return {
    sessionId,
    endedAt,
    gameId,
    inningsCompleted,
    currentInning,
    totalOutsRecorded,
    totalGoodUnits,
    totalBadUnits,
    sessionEabrFraction: totalBadUnits === 0 ? null : totalGoodUnits / totalBadUnits,
    sessionEabrDelta: totalGoodUnits - totalBadUnits,
    totalHitsAllowed: atBats.filter(e => isHitWithDetail(e, "single")).length,
    totalWalksAllowed: atBats.filter(e => e.outcomeType === "walk").length,
    totalHomeRunsAllowed: atBats.filter(e => isHitWithDetail(e, "home_run") || e.outcomeType === "home_run").length,
    totalExtraBaseHitsAllowed: atBats.filter(
      e => isHitWithDetail(e, "double") || isHitWithDetail(e, "triple") || e.outcomeType === "extra_base_hit",
    ).length,
    totalRBIAllowed,
    totalRunsAllowed,
    totalStrikeouts: atBats.reduce((sum, e) => sum + (e.strikeoutCount ?? 0), 0),
    totalFlyOuts: atBats.filter(e => e.outcomeType === "fly_out").length,
    totalGroundOuts: atBats.filter(e => e.outcomeType === "ground_out").length,
    totalLOB,
    inningSummaries,
    atBats,
  };
}

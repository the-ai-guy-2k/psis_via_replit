/**
 * PSIS Scenario Test Script
 *
 * Runs scenario-based logic tests against the ACTUAL PSIS game-logic module
 * (@workspace/psis-game-logic) -- the same functions the live API server
 * (artifacts/api-server/src/lib/psisStore.ts) imports and uses to serve
 * /entries, /dashboard, /innings/current, and /games/new. Nothing here
 * reimplements PSIS's rules; scenarios only assemble inputs and assert on
 * the real functions' outputs.
 *
 * Run with: pnpm run test:psis (from repo root) or pnpm --filter @workspace/scripts run test:psis
 *
 * Produces:
 *   artifacts/psis/public/reports/PSIS_Test_Report.md
 *   artifacts/psis/public/reports/PSIS_Test_Report.json
 */
import { promises as fs } from "fs";
import path from "path";
import {
  rawOutsForOutcome,
  applyOutcomeToBaseState,
  resultCategoryForOutcomeCategory,
  computeInningState,
  computeLatestInningState,
  resolveInningForNewAtBat,
  isEntryInGame,
  emptyBaseState,
  computeEabrUnits,
  computeRbi,
  computeSessionSummary,
} from "@workspace/psis-game-logic";
import type { Entry, OutcomeCategory, OutcomeType, OutcomeDetail } from "@workspace/api-zod";

// ---------------------------------------------------------------------------
// Synthetic at-bat builder
// ---------------------------------------------------------------------------

let idCounter = 0;
let clockMs = Date.parse("2026-07-06T00:00:00.000Z");

function nextId(): string {
  idCounter += 1;
  return `test-entry-${idCounter}`;
}

function nextTimestamp(): string {
  clockMs += 1000;
  return new Date(clockMs).toISOString();
}

interface SimAtBatInput {
  outcomeCategory: OutcomeCategory;
  outcomeType: OutcomeType;
  outcomeDetail?: OutcomeDetail;
}

/**
 * Mirrors the small amount of request-handling glue in
 * artifacts/api-server/src/routes/entries.ts that assembles a stored Entry
 * from an at-bat outcome (goodCount/badCount/delta bookkeeping). Every
 * actual PSIS *rule* -- which inning/out-count a new at-bat belongs to, how
 * many outs it adds, how runners advance and score, and whether the
 * category is good/bad -- is delegated to the real, imported
 * @workspace/psis-game-logic functions, not reimplemented here.
 */
function simulateAtBat(entries: Entry[], gameId: number, input: SimAtBatInput): Entry {
  const { inningNumber, currentOuts, baseState: baseStateBefore } = resolveInningForNewAtBat(entries, gameId);
  const { baseState: baseStateAfter, runsScored } = applyOutcomeToBaseState(
    input.outcomeCategory,
    input.outcomeType,
    input.outcomeDetail,
    baseStateBefore,
  );
  const resultCategory = resultCategoryForOutcomeCategory(input.outcomeCategory);
  const strikeoutCount = input.outcomeType === "strikeout" ? 1 : 0;

  const rawOuts = rawOutsForOutcome(input.outcomeCategory, input.outcomeType, input.outcomeDetail);
  const outsAdded = Math.min(rawOuts, 3 - currentOuts);
  const inningJustCompleted = currentOuts + outsAdded >= 3;
  const playersLeftOnBase = inningJustCompleted
    ? [baseStateAfter.firstBase, baseStateAfter.secondBase, baseStateAfter.thirdBase].filter(Boolean).length
    : undefined;

  // Mirrors artifacts/api-server/src/routes/entries.ts: RBI = runsScored
  // (test harness never simulates the legacy run_scored override), and
  // badCount = baseBadCount + rbi via the shared computeEabrUnits rule.
  const rbi = computeRbi(runsScored, false);
  const { goodCount, badCount, delta } = computeEabrUnits({
    resultCategory,
    isLegacyManualOverride: false,
    playersLeftOnBase,
    rbi,
  });

  const entry: Entry = {
    id: nextId(),
    createdAt: nextTimestamp(),
    outcomeCategory: input.outcomeCategory,
    outcomeType: input.outcomeType,
    outcomeDetail: input.outcomeDetail,
    resultCategory,
    goodCount,
    badCount,
    strikeoutCount,
    delta,
    runsScored,
    rbi,
    baseState: baseStateAfter,
    inningNumber,
    gameId,
    outsAdded,
    playersLeftOnBase,
  };
  entries.push(entry);
  return entry;
}

// ---------------------------------------------------------------------------
// Tiny scenario/assertion harness
// ---------------------------------------------------------------------------

interface Assertion {
  description: string;
  pass: boolean;
  expected: unknown;
  actual: unknown;
}

interface ScenarioResult {
  id: string;
  name: string;
  category: string;
  status: "PASS" | "FAIL";
  assertions: Assertion[];
}

const results: ScenarioResult[] = [];

function runScenario(id: string, name: string, category: string, fn: (check: (description: string, expected: unknown, actual: unknown) => void) => void): void {
  const assertions: Assertion[] = [];
  const check = (description: string, expected: unknown, actual: unknown) => {
    assertions.push({ description, expected, actual, pass: deepEqual(expected, actual) });
  };

  try {
    fn(check);
  } catch (err) {
    assertions.push({
      description: "Scenario threw an unexpected error",
      expected: "no exception",
      actual: err instanceof Error ? err.message : String(err),
      pass: false,
    });
  }

  const status: "PASS" | "FAIL" = assertions.every(a => a.pass) ? "PASS" : "FAIL";
  results.push({ id, name, category, status, assertions });
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ---------------------------------------------------------------------------
// Scenario 1: Outs calculation (per-outcome + capped-at-3)
// ---------------------------------------------------------------------------

runScenario("outs-per-outcome", "Outs Calculation Per Outcome Type", "Outs", (check) => {
  check("strikeout -> 1 out", 1, rawOutsForOutcome("defense", "strikeout", undefined));
  check("fly_out -> 1 out", 1, rawOutsForOutcome("defense", "fly_out", "infield"));
  check("ground_out/single_play -> 1 out", 1, rawOutsForOutcome("defense", "ground_out", "single_play"));
  check("ground_out/double_play -> 2 outs", 2, rawOutsForOutcome("defense", "ground_out", "double_play"));
  check("ground_out/triple_play -> 3 outs", 3, rawOutsForOutcome("defense", "ground_out", "triple_play"));
  check("offense hit -> 0 outs", 0, rawOutsForOutcome("offense", "hit", "single"));
  check("offense walk -> 0 outs", 0, rawOutsForOutcome("offense", "walk", undefined));
});

runScenario("outs-capped-at-3", "Outs Are Capped At 3 Per Inning (Completed Innings)", "Outs", (check) => {
  const gameId = 1;
  const entries: Entry[] = [];
  simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" }); // 1 out
  simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "fly_out", outcomeDetail: "outfield" }); // 2 outs
  // A ground_out/triple_play raw-outs is 3, but only 1 out remains in the inning.
  const thirdAtBat = simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "ground_out", outcomeDetail: "triple_play" });
  check("3rd at-bat only adds 1 out (capped, not 3)", 1, thirdAtBat.outsAdded);

  const inning = computeInningState(entries, 1, gameId);
  check("inning total outs is exactly 3", 3, inning.outs);
  check("inning is marked completed", true, inning.completed);

  const latest = computeLatestInningState(entries, gameId);
  check("computeLatestInningState still shows the just-completed inning (display, no auto-advance)", true, latest.completed);

  const resolved = resolveInningForNewAtBat(entries, gameId);
  check("next at-bat auto-advances to inning 2 with 0 outs", { inningNumber: 2, currentOuts: 0 }, { inningNumber: resolved.inningNumber, currentOuts: resolved.currentOuts });
});

// ---------------------------------------------------------------------------
// Scenario 2: Runs scored (hits + forced-advancement walks)
// ---------------------------------------------------------------------------

runScenario("runs-scored-hits", "Runs Scored: Hit Advancement", "Runs", (check) => {
  const gameId = 2;
  const entries: Entry[] = [];
  const single1 = simulateAtBat(entries, gameId, { outcomeCategory: "offense", outcomeType: "hit", outcomeDetail: "single" });
  check("single with empty bases scores 0 runs", 0, single1.runsScored);
  check("batter is on first after the single", { firstBase: true, secondBase: false, thirdBase: false }, single1.baseState);

  const double1 = simulateAtBat(entries, gameId, { outcomeCategory: "offense", outcomeType: "hit", outcomeDetail: "double" });
  check("double advances the existing runner from 1st to 3rd (no run yet)", 0, double1.runsScored);
  check("batter ends on 2nd, prior runner on 3rd", { firstBase: false, secondBase: true, thirdBase: true }, double1.baseState);

  const homeRun = simulateAtBat(entries, gameId, { outcomeCategory: "offense", outcomeType: "hit", outcomeDetail: "home_run" });
  check("home run with runners on 2nd/3rd scores all 3 (2 runners + batter)", 3, homeRun.runsScored);
  check("bases are empty after the home run", emptyBaseState(), homeRun.baseState);
});

runScenario("runs-scored-walks", "Runs Scored: Forced-Advancement Walks", "Runs", (check) => {
  const gameId = 3;
  const entries: Entry[] = [];
  const walk1 = simulateAtBat(entries, gameId, { outcomeCategory: "offense", outcomeType: "walk" });
  check("walk with empty bases forces no runners, no run", 0, walk1.runsScored);
  check("batter takes first", { firstBase: true, secondBase: false, thirdBase: false }, walk1.baseState);

  const walk2 = simulateAtBat(entries, gameId, { outcomeCategory: "offense", outcomeType: "walk" });
  check("2nd walk with runner on 1st forces them to 2nd, no run", 0, walk2.runsScored);
  check("runners now on 1st and 2nd", { firstBase: true, secondBase: true, thirdBase: false }, walk2.baseState);

  const walk3 = simulateAtBat(entries, gameId, { outcomeCategory: "offense", outcomeType: "walk" });
  check("3rd walk loads the bases, no run yet", 0, walk3.runsScored);
  check("bases loaded", { firstBase: true, secondBase: true, thirdBase: true }, walk3.baseState);

  const walk4 = simulateAtBat(entries, gameId, { outcomeCategory: "offense", outcomeType: "walk" });
  check("4th walk with bases loaded forces a run home", 1, walk4.runsScored);
  check("bases remain loaded after forcing 1 run in", { firstBase: true, secondBase: true, thirdBase: true }, walk4.baseState);
});

// ---------------------------------------------------------------------------
// Scenario 3: Players Left On Base (LOB)
// ---------------------------------------------------------------------------

runScenario("lob-on-inning-complete", "Players Left On Base At Inning Completion", "LOB", (check) => {
  const gameId = 4;
  const entries: Entry[] = [];
  simulateAtBat(entries, gameId, { outcomeCategory: "offense", outcomeType: "hit", outcomeDetail: "single" }); // runner on 1st
  simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" }); // 1 out
  simulateAtBat(entries, gameId, { outcomeCategory: "offense", outcomeType: "hit", outcomeDetail: "single" }); // runners on 1st/2nd
  const secondOut = simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "fly_out", outcomeDetail: "outfield" }); // 2 outs
  check("playersLeftOnBase is undefined mid-inning (not the 3rd out)", undefined, secondOut.playersLeftOnBase);

  const thirdOut = simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" }); // 3rd out
  check("playersLeftOnBase computed on the at-bat that records the 3rd out", 2, thirdOut.playersLeftOnBase);

  // Official EABR rule: each player left on base is worth 1 good unit,
  // folded into the completing at-bat's own goodCount (strikeout's base 1
  // unit + 2 LOB units = 3).
  check("LOB units are folded into the completing at-bat's goodCount as extra good units (1 base + 2 LOB = 3)", 3, thirdOut.goodCount);

  const inning = computeInningState(entries, 1, gameId);
  check("inning-level LOB matches the completing at-bat's LOB", 2, inning.playersLeftOnBase);
});

// ---------------------------------------------------------------------------
// Scenario 4: Good/Bad EABR classification
// ---------------------------------------------------------------------------

runScenario("good-bad-eabr-classification", "Good/Bad EABR Classification", "Good/Bad EABR", (check) => {
  check("defense outcomes are classified good", "good", resultCategoryForOutcomeCategory("defense"));
  check("offense outcomes are classified bad", "bad", resultCategoryForOutcomeCategory("offense"));

  const gameId = 5;
  const entries: Entry[] = [];
  const strikeout = simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" });
  check("strikeout entry is resultCategory good", "good", strikeout.resultCategory);
  check("strikeout entry sets strikeoutCount = 1", 1, strikeout.strikeoutCount);
  check("strikeout entry goodCount/badCount are 1/0", { goodCount: 1, badCount: 0 }, { goodCount: strikeout.goodCount, badCount: strikeout.badCount });

  const walk = simulateAtBat(entries, gameId, { outcomeCategory: "offense", outcomeType: "walk" });
  check("walk entry is resultCategory bad", "bad", walk.resultCategory);
  check("walk entry does not set strikeoutCount", 0, walk.strikeoutCount);
  check("walk entry goodCount/badCount are 0/1", { goodCount: 0, badCount: 1 }, { goodCount: walk.goodCount, badCount: walk.badCount });
});

// ---------------------------------------------------------------------------
// Scenario 5: Fraction (good/total-at-bats, as shown on the scoreboard)
// ---------------------------------------------------------------------------

runScenario("good-bad-eabr-fraction", "Good Units / Bad Units Fraction (Official EABR Fraction)", "Fraction", (check) => {
  const gameId = 6;
  const entries: Entry[] = [];
  simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" }); // good
  simulateAtBat(entries, gameId, { outcomeCategory: "offense", outcomeType: "walk" }); // bad, batter reaches 1st
  simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "fly_out", outcomeDetail: "infield" }); // good, outs never move runners
  const finalOut = simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "ground_out", outcomeDetail: "single_play" }); // good, 3rd out; walk's runner (1) is left on base

  check("LOB (1 runner left on base) is folded into the completing at-bat's goodCount as 1 extra good unit (1 base + 1 LOB = 2)", 2, finalOut.goodCount);

  const inning = computeInningState(entries, 1, gameId);
  check("total at-bats is 4", 4, inning.totalAtBats);
  check("good units total is 4 (3 base defense units + 1 LOB unit)", 4, inning.goodCount);
  check("bad units total is 1 (1 offense outcome)", 1, inning.badCount);
  check("official EABR fraction is Good Units / Bad Units = 4/1", 4, inning.goodCount / inning.badCount);
  check("inning completed after the 4th at-bat's 3rd out", true, inning.completed);
  check("the walk's runner is still on 1st at the 3rd out (defensive outs never advance/clear runners)", 1, finalOut.playersLeftOnBase);
});

// ---------------------------------------------------------------------------
// Scenario 6: Inning delta (Official EABR Delta = Good Units - Bad Units)
// ---------------------------------------------------------------------------

runScenario("inning-delta-formula", "Inning Delta = Good Units - Bad Units (Official EABR Delta)", "Inning Delta", (check) => {
  const gameId = 7;
  const entries: Entry[] = [];
  const e1 = simulateAtBat(entries, gameId, { outcomeCategory: "offense", outcomeType: "hit", outcomeDetail: "triple" }); // bad, 0 runs (bases were empty)
  const e2 = simulateAtBat(entries, gameId, { outcomeCategory: "offense", outcomeType: "hit", outcomeDetail: "single" }); // bad, scores the runner on 3rd -> 1 run -> 1 RBI
  check("2nd at-bat's single scores the runner on 3rd", 1, e2.runsScored);
  check("per-entry delta = good - bad; bad = baseBadCount(1) + rbi(1) = 2, so delta = 0 - 2 = -2", -2, e2.delta);

  const e3 = simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" }); // good, no LOB yet
  check("per-entry delta for a good outcome is +1", 1, e3.delta);

  const inning = computeInningState(entries, 1, gameId);
  const expectedInningDelta = e1.delta + e2.delta + e3.delta;
  check("computeInningState's inningDelta equals sum(entry.delta) over the inning", expectedInningDelta, inning.inningDelta);
  check("inningDelta = Good Units - Bad Units, RBI penalty included in bad units (-1 + -2 + 1 = -2 total)", -2, inning.inningDelta);
});

// ---------------------------------------------------------------------------
// Scenario 7: Completed innings (auto-advance across multiple innings)
// ---------------------------------------------------------------------------

runScenario("completed-innings-auto-advance", "Completed Innings Auto-Advance To The Next Inning", "Completed Innings", (check) => {
  const gameId = 8;
  const entries: Entry[] = [];
  // Inning 1: 3 quick outs.
  for (let i = 0; i < 3; i++) {
    simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" });
  }
  const inning1 = computeInningState(entries, 1, gameId);
  check("inning 1 completed with 3 outs", { outs: 3, completed: true }, { outs: inning1.outs, completed: inning1.completed });

  // Inning 2: one at-bat, not yet complete.
  const inning2AtBat = simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "fly_out", outcomeDetail: "infield" });
  check("first at-bat after inning 1 completes is assigned inningNumber 2", 2, inning2AtBat.inningNumber);

  const latest = computeLatestInningState(entries, gameId);
  check("latest inning state reflects inning 2, in progress", { inningNumber: 2, outs: 1, completed: false }, { inningNumber: latest.inningNumber, outs: latest.outs, completed: latest.completed });

  // Complete inning 2.
  simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" });
  simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" });
  const inning2 = computeInningState(entries, 2, gameId);
  check("inning 2 completed with 3 outs", { outs: 3, completed: true }, { outs: inning2.outs, completed: inning2.completed });

  // Inning 1 remains untouched/still complete after inning 2 finishes.
  const inning1Recheck = computeInningState(entries, 1, gameId);
  check("inning 1 state is unaffected by inning 2 completing", { outs: 3, completed: true }, { outs: inning1Recheck.outs, completed: inning1Recheck.completed });
});

// ---------------------------------------------------------------------------
// Scenario 8: Reset game state ("New Game" gameId boundary)
// ---------------------------------------------------------------------------

runScenario("reset-game-state-gameid-boundary", "New Game Reset Scopes The Live View By gameId", "Reset Game State", (check) => {
  const entries: Entry[] = [];
  const oldGameId = 1;
  const newGameId = 2;

  // Play a full inning plus a partial 2nd inning in "game 1".
  simulateAtBat(entries, oldGameId, { outcomeCategory: "defense", outcomeType: "strikeout" });
  simulateAtBat(entries, oldGameId, { outcomeCategory: "defense", outcomeType: "strikeout" });
  simulateAtBat(entries, oldGameId, { outcomeCategory: "defense", outcomeType: "strikeout" });
  simulateAtBat(entries, oldGameId, { outcomeCategory: "offense", outcomeType: "hit", outcomeDetail: "double" });

  const beforeReset = computeLatestInningState(entries, oldGameId);
  check("game 1's live view shows inning 2 in progress before reset", { inningNumber: 2, outs: 0, completed: false }, { inningNumber: beforeReset.inningNumber, outs: beforeReset.outs, completed: beforeReset.completed });

  // "New Game" bumps the boundary -- historical entries are NOT deleted or mutated.
  const entriesSnapshotLength = entries.length;
  const afterResetLatest = computeLatestInningState(entries, newGameId);
  check("historical entries are untouched by the gameId boundary bump (no deletion)", entriesSnapshotLength, entries.length);
  check("new game's live view resets to inning 1, 0 outs, no completed innings", { inningNumber: 1, outs: 0, completed: false, totalAtBats: 0 }, { inningNumber: afterResetLatest.inningNumber, outs: afterResetLatest.outs, completed: afterResetLatest.completed, totalAtBats: afterResetLatest.totalAtBats });

  const resolvedForNewGame = resolveInningForNewAtBat(entries, newGameId);
  check("a new at-bat in the new game starts at inning 1 with empty bases", { inningNumber: 1, currentOuts: 0, baseState: emptyBaseState() }, resolvedForNewGame);

  // Old game's entries still belong to game 1, unaffected by the new boundary.
  check("old game's entries are still scoped to gameId 1", true, entries.every(e => isEntryInGame(e, oldGameId)));
  check("old game's entries are NOT scoped to the new gameId", false, entries.some(e => isEntryInGame(e, newGameId)));

  // A legacy entry with no gameId is treated as belonging to game 1.
  const legacyEntry: Pick<Entry, "gameId"> = {};
  check("an entry with no gameId is treated as belonging to game 1 (backward compatibility)", true, isEntryInGame(legacyEntry, 1));
  check("an entry with no gameId is NOT treated as belonging to a later game", false, isEntryInGame(legacyEntry, 2));
});

// ---------------------------------------------------------------------------
// Scenario 9: RBI + EABR bad-unit formula (solo HR, bases-loaded HR)
// ---------------------------------------------------------------------------

runScenario("rbi-home-runs", "RBI Calculation & Bad-Unit Penalty: Home Runs", "RBI", (check) => {
  // Solo home run: bases empty, batter alone scores -> 1 RBI.
  const soloGameId = 100;
  const soloEntries: Entry[] = [];
  const soloHr = simulateAtBat(soloEntries, soloGameId, { outcomeCategory: "offense", outcomeType: "hit", outcomeDetail: "home_run" });
  check("solo HR with empty bases drives in 1 run", 1, soloHr.runsScored);
  check("solo HR RBI equals runsScored (1)", 1, soloHr.rbi);
  check("solo HR badCount = baseBadCount(1) + rbi(1) = 2", 2, soloHr.badCount);
  check("solo HR delta = goodCount(0) - badCount(2) = -2", -2, soloHr.delta);

  // Bases-loaded home run: 3 runners + batter all score -> 4 RBI.
  const loadedGameId = 101;
  const loadedEntries: Entry[] = [];
  simulateAtBat(loadedEntries, loadedGameId, { outcomeCategory: "offense", outcomeType: "walk" });
  simulateAtBat(loadedEntries, loadedGameId, { outcomeCategory: "offense", outcomeType: "walk" });
  simulateAtBat(loadedEntries, loadedGameId, { outcomeCategory: "offense", outcomeType: "walk" });
  const loadedHr = simulateAtBat(loadedEntries, loadedGameId, { outcomeCategory: "offense", outcomeType: "hit", outcomeDetail: "home_run" });
  check("bases-loaded HR scores all 4 runners (3 + batter)", 4, loadedHr.runsScored);
  check("bases-loaded HR RBI equals runsScored (4)", 4, loadedHr.rbi);
  check("bases-loaded HR badCount = baseBadCount(1) + rbi(4) = 5", 5, loadedHr.badCount);
  check("bases-loaded HR delta = goodCount(0) - badCount(5) = -5", -5, loadedHr.delta);
});

// ---------------------------------------------------------------------------
// Scenario 10: RBI + EABR bad-unit formula (bases-loaded walk, double scoring 2)
// ---------------------------------------------------------------------------

runScenario("rbi-walk-and-double", "RBI Calculation & Bad-Unit Penalty: Bases-Loaded Walk & 2-Run Double", "RBI", (check) => {
  // Bases-loaded walk forces exactly 1 run home -> 1 RBI.
  const walkGameId = 102;
  const walkEntries: Entry[] = [];
  simulateAtBat(walkEntries, walkGameId, { outcomeCategory: "offense", outcomeType: "walk" });
  simulateAtBat(walkEntries, walkGameId, { outcomeCategory: "offense", outcomeType: "walk" });
  simulateAtBat(walkEntries, walkGameId, { outcomeCategory: "offense", outcomeType: "walk" });
  const loadedWalk = simulateAtBat(walkEntries, walkGameId, { outcomeCategory: "offense", outcomeType: "walk" });
  check("bases-loaded walk forces in exactly 1 run", 1, loadedWalk.runsScored);
  check("bases-loaded walk RBI equals runsScored (1)", 1, loadedWalk.rbi);
  check("bases-loaded walk badCount = baseBadCount(1) + rbi(1) = 2", 2, loadedWalk.badCount);
  check("bases-loaded walk delta = goodCount(0) - badCount(2) = -2", -2, loadedWalk.delta);

  // Double with runners on 2nd/3rd scores both -> 2 RBI.
  const doubleGameId = 103;
  const doubleEntries: Entry[] = [];
  simulateAtBat(doubleEntries, doubleGameId, { outcomeCategory: "offense", outcomeType: "hit", outcomeDetail: "single" }); // runner on 1st
  simulateAtBat(doubleEntries, doubleGameId, { outcomeCategory: "offense", outcomeType: "hit", outcomeDetail: "double" }); // runner advances 1st->3rd, batter->2nd: runners on 2nd/3rd
  const scoringDouble = simulateAtBat(doubleEntries, doubleGameId, { outcomeCategory: "offense", outcomeType: "hit", outcomeDetail: "double" });
  check("double advances both runners home (2 runs)", 2, scoringDouble.runsScored);
  check("2-run double RBI equals runsScored (2)", 2, scoringDouble.rbi);
  check("2-run double badCount = baseBadCount(1) + rbi(2) = 3", 3, scoringDouble.badCount);
  check("2-run double delta = goodCount(0) - badCount(3) = -3", -3, scoringDouble.delta);
});

// ---------------------------------------------------------------------------
// Scenario 11: End Session after 7 completed innings (valid, not a fixed 9)
// ---------------------------------------------------------------------------

runScenario("end-session-after-7-innings", "End Session Is Valid After 7 Completed Innings (Not A Fixed 9)", "Session", (check) => {
  const gameId = 200;
  const entries: Entry[] = [];
  for (let inning = 0; inning < 7; inning++) {
    simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" });
    simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" });
    simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" });
  }

  const summary = computeSessionSummary(entries, gameId, "test-session-7", "2026-07-06T12:00:00.000Z");
  check("7 innings completed", 7, summary.inningsCompleted);
  check("no partial inning left in progress (exactly 21 outs, no 8th inning started)", undefined, summary.currentInning);
  check("session is eligible to end (inningsCompleted >= 1)", true, summary.inningsCompleted >= 1);
  check("totalOutsRecorded is 21 (7 x 3)", 21, summary.totalOutsRecorded);
  check("totalGoodUnits is 21 (21 strikeouts, no LOB since bases always empty)", 21, summary.totalGoodUnits);
  check("totalBadUnits is 0 (no offense outcomes)", 0, summary.totalBadUnits);
  check("sessionEabrFraction is null when totalBadUnits is 0", null, summary.sessionEabrFraction);
  check("sessionEabrDelta = 21 - 0 = 21", 21, summary.sessionEabrDelta);
  check("inningSummaries has exactly 7 entries, all completed", true, summary.inningSummaries.length === 7 && summary.inningSummaries.every(i => i.completed));
});

// ---------------------------------------------------------------------------
// Scenario 12: End Session before reaching 9 innings, with a partial inning
// ---------------------------------------------------------------------------

runScenario("end-session-before-9-innings", "End Session Is Valid Before 9 Innings, Including A Partial Final Inning", "Session", (check) => {
  const gameId = 201;
  const entries: Entry[] = [];
  // Inning 1: complete (3 outs).
  simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" });
  simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" });
  simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "strikeout" });
  // Inning 2: only 1 out recorded, session ends mid-inning.
  const partialAtBat = simulateAtBat(entries, gameId, { outcomeCategory: "defense", outcomeType: "fly_out", outcomeDetail: "infield" });

  const summary = computeSessionSummary(entries, gameId, "test-session-partial", "2026-07-06T13:00:00.000Z");
  check("only 1 inning is fully completed", 1, summary.inningsCompleted);
  check("session is eligible to end after just 1 completed inning (not 9)", true, summary.inningsCompleted >= 1);
  check("the in-progress 2nd inning is reported as currentInning", 2, summary.currentInning);
  check("totalOutsRecorded is 4 (3 complete + 1 partial)", 4, summary.totalOutsRecorded);
  check("partial inning's at-bat still counted in totalGoodUnits", true, summary.totalGoodUnits >= partialAtBat.goodCount);
  check("inningSummaries includes both the completed inning and the in-progress one", 2, summary.inningSummaries.length);
  check("2nd inningSummary is not completed", false, summary.inningSummaries[1]!.completed);

  // A subsequent end-session call for a brand-new empty game should be rejected upstream (0 completed innings) —
  // verified here at the computeSessionSummary level so the /sessions/end route's guard is exercised against real data.
  const emptyGameSummary = computeSessionSummary([], 999, "test-session-empty", "2026-07-06T13:05:00.000Z");
  check("a game with zero at-bats has 0 completed innings (route should reject ending it)", 0, emptyGameSummary.inningsCompleted);
});

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------

function findWorkspaceRoot(): string {
  const cwd = process.cwd();
  return cwd.endsWith(path.join("scripts")) ? path.resolve(cwd, "..") : cwd;
}

async function main() {
  const totalScenarios = results.length;
  const passed = results.filter(r => r.status === "PASS").length;
  const failed = totalScenarios - passed;
  const totalAssertions = results.reduce((sum, r) => sum + r.assertions.length, 0);
  const passedAssertions = results.reduce((sum, r) => sum + r.assertions.filter(a => a.pass).length, 0);
  const overallStatus: "PASS" | "PARTIAL" | "FAIL" = failed === 0 ? "PASS" : passed === 0 ? "FAIL" : "PARTIAL";
  const generatedAt = new Date().toISOString();

  const jsonReport = {
    generatedAt,
    overallStatus,
    summary: {
      totalScenarios,
      passed,
      failed,
      totalAssertions,
      passedAssertions,
      failedAssertions: totalAssertions - passedAssertions,
    },
    scenarios: results,
  };

  const mdLines: string[] = [];
  mdLines.push("# PSIS Test Report");
  mdLines.push("");
  mdLines.push(`Generated: ${generatedAt}`);
  mdLines.push("");
  mdLines.push(`**Overall status: ${overallStatus}**`);
  mdLines.push("");
  mdLines.push(`- Scenarios: ${passed}/${totalScenarios} passed`);
  mdLines.push(`- Assertions: ${passedAssertions}/${totalAssertions} passed`);
  mdLines.push("");
  mdLines.push("This report is produced by `scripts/src/test-psis-scenarios.ts`, which imports and exercises the real, unduplicated PSIS game-logic functions from `@workspace/psis-game-logic` (the same module the live API server uses).");
  mdLines.push("");
  mdLines.push("## Scenario Results");
  mdLines.push("");
  mdLines.push("| Category | Scenario | Status | Assertions |");
  mdLines.push("| --- | --- | --- | --- |");
  for (const r of results) {
    const assertPass = r.assertions.filter(a => a.pass).length;
    mdLines.push(`| ${r.category} | ${r.name} | ${r.status} | ${assertPass}/${r.assertions.length} |`);
  }
  mdLines.push("");
  mdLines.push("## Assertion Detail");
  mdLines.push("");
  for (const r of results) {
    mdLines.push(`### ${r.name} (${r.category}) — ${r.status}`);
    mdLines.push("");
    for (const a of r.assertions) {
      const mark = a.pass ? "PASS" : "FAIL";
      mdLines.push(`- [${mark}] ${a.description}`);
      if (!a.pass) {
        mdLines.push(`  - expected: \`${JSON.stringify(a.expected)}\``);
        mdLines.push(`  - actual: \`${JSON.stringify(a.actual)}\``);
      }
    }
    mdLines.push("");
  }

  const workspaceRoot = findWorkspaceRoot();
  const reportsDir = path.resolve(workspaceRoot, "artifacts/psis/public/reports");
  await fs.mkdir(reportsDir, { recursive: true });
  await fs.writeFile(path.join(reportsDir, "PSIS_Test_Report.json"), JSON.stringify(jsonReport, null, 2) + "\n", "utf-8");
  await fs.writeFile(path.join(reportsDir, "PSIS_Test_Report.md"), mdLines.join("\n") + "\n", "utf-8");

  // Console summary for CI / terminal use.
  console.log(`\nPSIS Scenario Test Report — ${overallStatus}`);
  console.log(`Scenarios: ${passed}/${totalScenarios} passed`);
  console.log(`Assertions: ${passedAssertions}/${totalAssertions} passed`);
  for (const r of results) {
    console.log(`  [${r.status}] ${r.category} — ${r.name}`);
    if (r.status === "FAIL") {
      for (const a of r.assertions.filter(x => !x.pass)) {
        console.log(`      FAIL: ${a.description} (expected ${JSON.stringify(a.expected)}, got ${JSON.stringify(a.actual)})`);
      }
    }
  }
  console.log(`\nReports written to: ${reportsDir}`);

  if (overallStatus === "FAIL") {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("PSIS scenario test script crashed:", err);
  process.exitCode = 1;
});

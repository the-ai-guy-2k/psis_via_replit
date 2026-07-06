# PSIS Test Report

Generated: 2026-07-06T01:12:10.508Z

**Overall status: PASS**

- Scenarios: 10/10 passed
- Assertions: 61/61 passed

This report is produced by `scripts/src/test-psis-scenarios.ts`, which imports and exercises the real, unduplicated PSIS game-logic functions from `@workspace/psis-game-logic` (the same module the live API server uses).

## Scenario Results

| Category | Scenario | Status | Assertions |
| --- | --- | --- | --- |
| Outs | Outs Calculation Per Outcome Type | PASS | 7/7 |
| Outs | Outs Are Capped At 3 Per Inning (Completed Innings) | PASS | 5/5 |
| Runs | Runs Scored: Hit Advancement | PASS | 6/6 |
| Runs | Runs Scored: Forced-Advancement Walks | PASS | 8/8 |
| LOB | Players Left On Base At Inning Completion | PASS | 3/3 |
| Good/Bad EABR | Good/Bad EABR Classification | PASS | 8/8 |
| Fraction | Good-Count / Total-At-Bats Fraction | PASS | 6/6 |
| Inning Delta | Inning Delta = Good - Bad - RunsScored | PASS | 5/5 |
| Completed Innings | Completed Innings Auto-Advance To The Next Inning | PASS | 5/5 |
| Reset Game State | New Game Reset Scopes The Live View By gameId | PASS | 8/8 |

## Assertion Detail

### Outs Calculation Per Outcome Type (Outs) — PASS

- [PASS] strikeout -> 1 out
- [PASS] fly_out -> 1 out
- [PASS] ground_out/single_play -> 1 out
- [PASS] ground_out/double_play -> 2 outs
- [PASS] ground_out/triple_play -> 3 outs
- [PASS] offense hit -> 0 outs
- [PASS] offense walk -> 0 outs

### Outs Are Capped At 3 Per Inning (Completed Innings) (Outs) — PASS

- [PASS] 3rd at-bat only adds 1 out (capped, not 3)
- [PASS] inning total outs is exactly 3
- [PASS] inning is marked completed
- [PASS] computeLatestInningState still shows the just-completed inning (display, no auto-advance)
- [PASS] next at-bat auto-advances to inning 2 with 0 outs

### Runs Scored: Hit Advancement (Runs) — PASS

- [PASS] single with empty bases scores 0 runs
- [PASS] batter is on first after the single
- [PASS] double advances the existing runner from 1st to 3rd (no run yet)
- [PASS] batter ends on 2nd, prior runner on 3rd
- [PASS] home run with runners on 2nd/3rd scores all 3 (2 runners + batter)
- [PASS] bases are empty after the home run

### Runs Scored: Forced-Advancement Walks (Runs) — PASS

- [PASS] walk with empty bases forces no runners, no run
- [PASS] batter takes first
- [PASS] 2nd walk with runner on 1st forces them to 2nd, no run
- [PASS] runners now on 1st and 2nd
- [PASS] 3rd walk loads the bases, no run yet
- [PASS] bases loaded
- [PASS] 4th walk with bases loaded forces a run home
- [PASS] bases remain loaded after forcing 1 run in

### Players Left On Base At Inning Completion (LOB) — PASS

- [PASS] playersLeftOnBase is undefined mid-inning (not the 3rd out)
- [PASS] playersLeftOnBase computed on the at-bat that records the 3rd out
- [PASS] inning-level LOB matches the completing at-bat's LOB

### Good/Bad EABR Classification (Good/Bad EABR) — PASS

- [PASS] defense outcomes are classified good
- [PASS] offense outcomes are classified bad
- [PASS] strikeout entry is resultCategory good
- [PASS] strikeout entry sets strikeoutCount = 1
- [PASS] strikeout entry goodCount/badCount are 1/0
- [PASS] walk entry is resultCategory bad
- [PASS] walk entry does not set strikeoutCount
- [PASS] walk entry goodCount/badCount are 0/1

### Good-Count / Total-At-Bats Fraction (Fraction) — PASS

- [PASS] total at-bats is 4
- [PASS] good count is 3 (3 defense outcomes)
- [PASS] bad count is 1 (1 offense outcome)
- [PASS] fraction (goodCount/totalAtBats) is 3/4
- [PASS] inning completed after the 4th at-bat's 3rd out
- [PASS] the walk's runner is still on 1st at the 3rd out (defensive outs never advance/clear runners)

### Inning Delta = Good - Bad - RunsScored (Inning Delta) — PASS

- [PASS] 2nd at-bat's single scores the runner on 3rd
- [PASS] per-entry delta = good - bad - runs (0 - 1 - 1 = -2)
- [PASS] per-entry delta for a good outcome with no runs is +1
- [PASS] computeInningState's inningDelta equals sum(entry.delta) over the inning
- [PASS] inningDelta reflects both bad hits and the good strikeout (-1 + -2 + 1 = -2 total)

### Completed Innings Auto-Advance To The Next Inning (Completed Innings) — PASS

- [PASS] inning 1 completed with 3 outs
- [PASS] first at-bat after inning 1 completes is assigned inningNumber 2
- [PASS] latest inning state reflects inning 2, in progress
- [PASS] inning 2 completed with 3 outs
- [PASS] inning 1 state is unaffected by inning 2 completing

### New Game Reset Scopes The Live View By gameId (Reset Game State) — PASS

- [PASS] game 1's live view shows inning 2 in progress before reset
- [PASS] historical entries are untouched by the gameId boundary bump (no deletion)
- [PASS] new game's live view resets to inning 1, 0 outs, no completed innings
- [PASS] a new at-bat in the new game starts at inning 1 with empty bases
- [PASS] old game's entries are still scoped to gameId 1
- [PASS] old game's entries are NOT scoped to the new gameId
- [PASS] an entry with no gameId is treated as belonging to game 1 (backward compatibility)
- [PASS] an entry with no gameId is NOT treated as belonging to a later game


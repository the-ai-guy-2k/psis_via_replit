# Working With EABR

Business intent and implementation guide for PSIS scoring rules.

---

## Business Intent

**EABR (End of At-Bat Result)** is the framework pitching coaches use to classify each plate appearance as pitcher-favorable (**good**) or pitcher-unfavorable (**bad**), then summarize performance.

PSIS automates:

- Logging outcomes through a guided wizard
- Computing good/bad units, delta, and fraction
- Tracking innings, outs, runs, and LOB
- Saving session summaries for review

You do not need deep baseball knowledge to maintain the code — you need to follow the rules documented here and in scenario tests.

---

## Outcome Wizard (User Flow)

```
Outcome → Defense or Offense → Specific type → Optional detail → EABR reached → Log
```

| Defense examples | Offense examples |
|------------------|------------------|
| Strikeout, Fly Out, Ground Out | Walk, Hit (single/double/triple/HR) |

Wizard options: `artifacts/psis/src/lib/outcome.ts`  
Server validation: `artifacts/api-server/src/routes/entries.ts`

---

## Scoring Rules (Summary)

### Good / bad classification

| `outcomeCategory` | Category |
|-------------------|----------|
| `defense` | **good** (pitcher-favorable) |
| `offense` | **bad** (pitcher-unfavorable) |

### Units per at-bat

- Each defensive outcome = **1 good unit** (plus LOB on inning-ending at-bat)
- Each offensive outcome = **1 bad unit** + **RBI penalty** on bad units
- LOB at inning end = **+1 good unit each**, baked into completing at-bat's `goodCount`

### Delta (official)

```
Delta = Good Units − Bad Units
```

`runsScored` is stored for display but **not** subtracted separately from delta.

### Fraction (official)

```
Fraction = Good Units / Bad Units
```

Shown on scoreboard as `goodCount/badCount`.

---

## RBI Logic

`computeRbi()` in `psis-game-logic`:

| Outcome | RBI |
|---------|-----|
| Hit | Runners (and batter on HR) who score |
| Walk | 1 if bases loaded, else 0 |
| Other | 0 |

RBI adds to **bad units**: `badCount = 1 + rbi` for offensive outcomes.

---

## Outs and Innings

- Defensive outcomes add outs (`rawOutsForOutcome`)
- Ground out outs depend on `outcomeDetail` (single/double/triple play)
- Outs capped at 3 per inning
- Inning completes at 3 outs; next at-bat may advance inning number

**Critical:** `computeLatestInningState` is display-only. `resolveInningForNewAtBat` assigns inning on create. Do not merge them.

---

## Game vs Session

| Concept | Purpose |
|---------|---------|
| **gameId** | Resets Tracker live view (New Game) |
| **Session** | Coach-ended summary saved to dashboard |

End Session requires ≥1 completed inning, then bumps `gameId` like New Game.

---

## Where Calculations Live

| Calculation | Function | File |
|-------------|----------|------|
| Outs | `rawOutsForOutcome` | `lib/psis-game-logic` |
| Base state / runs | `applyOutcomeToBaseState` | `lib/psis-game-logic` |
| Inning state | `computeInningState` | `lib/psis-game-logic` |
| EABR units | `computeEabrUnits` | `lib/psis-game-logic` |
| RBI | `computeRbi` | `lib/psis-game-logic` |
| Session summary | `computeSessionSummary` | `lib/psis-game-logic` |
| Persist entry | `appendEntry` | `psisStore.ts` |
| HTTP glue | POST handler | `entries.ts` |

---

## How to Safely Modify Calculations

```
1. Read existing scenario tests for the rule
2. Change lib/psis-game-logic/src/index.ts
3. Update or add scenario in test-psis-scenarios.ts
4. pnpm run test:psis → PASS
5. Manual smoke on Tracker if UI-facing
```

**Never:**

- Change assertion expected values without approval
- Duplicate formula in `entries.ts` or React
- Subtract runs from delta separately

---

## Common Mistakes

| Mistake | Consequence |
|---------|-------------|
| Trust client-sent `goodCount` | Wrong scores — server must compute |
| Merge display/assignment inning logic | Completed inning summary disappears |
| Add outcome to wizard only | Server rejects or mis-scores |
| Use `entry.result` in UI | Breaks legacy entries display |
| Edit test expectations to match bug | Hides regression |

---

## Learn More

- Executable examples: `scripts/src/test-psis-scenarios.ts`
- Full history: `replit.md`
- Senior reference: [../developer/Game_Logic_Overview.md](../developer/Game_Logic_Overview.md)

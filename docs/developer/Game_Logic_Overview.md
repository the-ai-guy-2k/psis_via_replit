# Game Logic Overview

EABR rules, calculations, and where they live in code.

---

## Terminology

| Term | Meaning |
|------|---------|
| **EABR** | End of At-Bat Result — the terminal outcome of a plate appearance |
| **Good unit** | Defensive success credit (pitcher-favorable) |
| **Bad unit** | Offensive success credit (pitcher-unfavorable) |
| **Delta** | Good units − Bad units for an inning or session |
| **Fraction** | Good units / Bad units (official EABR fraction) |
| **LOB** | Runners left on base at inning completion — each adds 1 good unit |
| **RBI** | Runs batted in — adds to bad units on offensive outcomes |
| **gameId** | Boundary separating live tracker view from historical data |
| **Session** | Coach-ended summary of a pitching unit's work |

---

## Core Formulas

### EABR units (per at-bat)

- **Defense outcome:** `goodCount = 1` (+ LOB baked in on completing at-bat), `badCount = 0`
- **Offense outcome:** `badCount = 1 + rbi`, `goodCount = 0` (except LOB on inning completion)
- **LOB at inning end:** Added to completing at-bat's `goodCount`
- **Delta:** `goodCount − badCount` (runs stored for display but not subtracted separately)

### EABR fraction

```
Fraction = goodCount / badCount
```

Displayed on 9-box scoreboard as `goodCount/badCount`.

### Outs

Computed by `rawOutsForOutcome()` in `lib/psis-game-logic`:

| Outcome | Outs |
|---------|------|
| strikeout, fly_out | 1 |
| ground_out + single_play | 1 |
| ground_out + double_play | 2 |
| ground_out + triple_play | 3 |
| offense outcomes | 0 |

Capped so inning total never exceeds 3.

### Base state and runs

`applyOutcomeToBaseState()` simulates 1B/2B/3B:

- **Walk:** forced advancement
- **Hit:** uniform advance by hit type (single=1, double=2, triple=3, HR=4)
- **Defense outs:** runners do not advance (MVP model)

`playersLeftOnBase` computed when outs reach 3.

### RBI

`computeRbi()` derives from base-state simulation:

- Hit: runners + batter who score
- Walk: 1 only if bases loaded
- Other: 0

---

## Inning Lifecycle

```
1. resolveInningForNewAtBat() assigns inningNumber for new entry
2. At-bats accumulate until outsAdded sum to 3
3. computeLatestInningState() shows display (may show completed inning)
4. Next at-bat auto-advances to next inning via resolveInningForNewAtBat()
```

**Invariant:** Never merge display and assignment logic.

---

## Session Calculations

`computeSessionSummary(entries, gameId, sessionId, endedAt)` aggregates:

- Innings completed, total good/bad, EABR delta, fraction
- Hits, walks, HRs, XBH, RBI, runs allowed, strikeouts, LOB
- `inningSummaries[]` and `atBats[]` for dashboard detail view

Triggered by `POST /api/sessions/end` after ≥1 completed inning check.

---

## Where Calculations Live

| Concern | Module | Function(s) |
|---------|--------|-------------|
| Outs | `psis-game-logic` | `rawOutsForOutcome` |
| Base state | `psis-game-logic` | `applyOutcomeToBaseState`, `advanceRunners`, `applyWalk` |
| Inning aggregation | `psis-game-logic` | `computeInningState`, `computeLatestInningState` |
| Inning assignment | `psis-game-logic` | `resolveInningForNewAtBat` |
| EABR units | `psis-game-logic` | `computeEabrUnits` |
| RBI | `psis-game-logic` | `computeRbi` |
| Session summary | `psis-game-logic` | `computeSessionSummary` |
| Request glue | `routes/entries.ts` | Assembles input, calls lib, validates details |
| Persistence | `psisStore.ts` | Append entry, read files |

**Never duplicate rules in routes or UI** — import from `@workspace/psis-game-logic`.

---

## Wizard vs Server Validation

| Layer | Responsibility |
|-------|----------------|
| `artifacts/psis/src/lib/outcome.ts` | Wizard options, `detailOptionsForOutcomeType()`, `describeOutcome()` |
| `routes/entries.ts` | `VALID_DETAILS_BY_TYPE` server-side detail enforcement |
| `psis-game-logic` | Numeric outcomes from validated types |

UI gating and server validation must stay aligned when adding outcomes.

---

## How to Add a New Rule

1. **Define behavior** in plain language (get approval for EABR impact)
2. **Implement** in `lib/psis-game-logic/src/index.ts`
3. **Add scenario test** in `scripts/src/test-psis-scenarios.ts`
4. **Run** `pnpm run test:psis` — reports regenerate in `artifacts/psis/public/reports/`
5. **Update OpenAPI** if schema fields change → `codegen`
6. **Update wizard** in `outcome.ts` if user-selectable
7. **Update server validation** in `entries.ts` if needed
8. **Do not** change rules only in `psisStore.ts` or UI

---

## Scenario Test Suite

```
pnpm run test:psis
```

| Metric | Current |
|--------|---------|
| Scenarios | 14 |
| Assertions | 96 |
| Gate | CI + Docker build |

Tests import `@workspace/psis-game-logic` directly — no server required.

---

## Legacy Compatibility

Pre-wizard entries used flat `result` field and legacy `outcomeType` values (`infield_catch`, top-level `double_play`, etc.). Schema retains these enums for validation. UI uses `describeOutcome()` — never read raw `entry.result` in new code.

---

## Further Reading

- `replit.md` — exhaustive decision history
- `scripts/src/test-psis-scenarios.ts` — executable rule examples
- `lib/api-spec/openapi.yaml` — Entry schema

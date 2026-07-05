# PSIS — Pitch Sequence Intelligence System

A web tool for baseball pitching coaches to log pitch sequences per plate appearance and track Good/Bad/Delta outcomes, with a dashboard of best/worst sequences and season-to-date aggregates.

## Run & Operate

- Preview: the `artifacts/psis: web` and `artifacts/api-server: API Server` workflows run automatically; restart via the workflows skill if code changes aren't reflected.
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from `lib/api-spec/openapi.yaml` after any contract change
- No database setup needed — this app intentionally uses flat-file JSON storage (see Architecture decisions).

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (`artifacts/psis`), wouter routing, react-query, react-hook-form + Zod
- API: Express 5 (`artifacts/api-server`)
- Storage: flat JSON file (`artifacts/api-server/data/psis_entries.json`) — no Postgres/Drizzle used
- Validation: Zod (`zod/v4`)
- API codegen: Orval (from OpenAPI spec) — generates typed React Query hooks

## Where things live

- `lib/api-spec/openapi.yaml` — source-of-truth API contract (entries, dashboard, schemas)
- `artifacts/api-server/src/lib/psisStore.ts` — JSON file read/write/append helpers
- `artifacts/api-server/src/routes/entries.ts` — GET/POST `/entries`
- `artifacts/api-server/src/routes/dashboard.ts` — GET `/dashboard` (aggregates, best/worst sequences)
- `artifacts/api-server/data/psis_entries.json` — the actual data store (seeded with 5 example entries)
- `artifacts/psis/src/pages/` — home, track (data-entry form), dashboard

## Architecture decisions

- **Original spec asked for Python/Flask + a JSON file, but this workspace only supports pnpm/TypeScript artifacts (React+Vite / Express).** Rebuilt the same functionality on the supported stack: React+Vite frontend + Express backend, keeping the JSON-file storage intent (no Postgres) since the original spec emphasized simplest possible storage.
- **EABR progressive click flow (Outcome Wizard v2)**: the Tracker no longer shows all wizard choices at once. It's a fully click-gated flow: only an "Outcome" tile is shown initially → click reveals Defense/Offense → click reveals that category's outcome-type buttons → some types need one more follow-up click → once an EABR ("End of At-Bat Result") is reached, Notes + "Log PA Entry" appear. Nothing is ever saved before EABR. State lives in `track.tsx`'s `WizardState` (`started`, `outcomeCategory`, `outcomeType`, `outcomeDetail`); `isEabrReached` gates the submit button, `goBack`/`resetForm` pop or clear the path, and a `breadcrumb` array renders the current path (e.g. "Outcome › Defense › Ground Out › Double Play"). Defense top-level options: Strikeout, Fly Out, Ground Out. Offense top-level options: Hit, Walk. Follow-ups: Fly Out → catch location (Infield/Outfield); Ground Out → play result (Single Play/Double Play/Triple Play, `outcomeDetail`); Hit → hit type (Single/Double/Triple/Home Run, `outcomeDetail`). Strikeout and Walk are themselves the EABR with no follow-up. `detailOptionsForOutcomeType()` in `artifacts/psis/src/lib/outcome.ts` is the single source of truth for which outcome types need a follow-up click and what its options are — both the wizard's gating logic and its rendered buttons read from it, so adding a new branch only requires editing that one function.
- **"Run Scored" removed as a manual offense option**: it used to be a top-level Offense wizard choice with a manual 1-4 runs picker. It's been replaced by automatic base-state-driven run calculation (see "Base-state simulation" below) and removed from `OFFENSE_OUTCOMES` in `outcome.ts`. It's kept in the `OutcomeType` schema enum (and the server still accepts a manual `runsScored` for it) purely so pre-existing stored entries keep validating — the wizard can never produce it anymore.
- **Infield Out removed from the wizard**: per an approved tracker-logic update, `infield_out` is no longer a selectable Defense option (`DEFENSE_OUTCOMES` in `outcome.ts`). It (and legacy `infield_catch`) remain in the `OutcomeType` schema enum and server out-count mapping purely so pre-existing stored entries keep validating/rendering — new entries can never produce them.
- **Game Status Panel**: replaces the old static helper-text description under "Log At-Bat Outcome" on the Tracker header. Shows current Inning, Outs, Current Δ, and a live Bases display (1B/2B/3B occupancy dots, `BaseStateDisplay` component) — all sourced from the same `GET /innings/current` data as before, no API change — plus a "Completed" section showing one scoreboard-style tile per finished inning (top: final inning delta, middle: goodCount/totalAtBats fraction, bottom: inning number). The completed tiles are computed purely client-side in `track.tsx` (`computeCompletedInningTiles`) from the full `GET /entries` list — an inning counts as complete once its at-bats' `outsAdded` sum to 3, mirroring the server's own completion rule without a new endpoint.
- **OutcomeType/OutcomeDetail schema note**: `ground_out`'s play result (single_play/double_play/triple_play) and `hit`'s hit type (single/double/triple/home_run) live in `outcomeDetail`, not as separate top-level `outcomeType` values — this replaced an earlier flat design where `double_play`/`triple_play`/`extra_base_hit`/`home_run` were standalone `outcomeType`s. Those old top-level enum values (plus `infield_catch`, superseded by `infield_out`) are kept permanently in the `OutcomeType`/`OutcomeDetail` enums purely so pre-existing stored entries keep validating — the new wizard never produces them. `describeOutcome()` in `outcome.ts` is generic (`outcomeType` label + optional `outcomeDetail` label) so it renders both old and new shapes without a branch per type.
- Server-side detail validation lives in `entries.ts`'s `VALID_DETAILS_BY_TYPE` map: `ground_out`/`fly_out`/`hit` require a matching `outcomeDetail`, everything else rejects one. `rawOutsForOutcome()` in `psisStore.ts` computes ground_out's outs from its `outcomeDetail` (single_play=1/double_play=2/triple_play=3) instead of a flat per-type lookup, since the same `outcomeType` now yields different out counts depending on the follow-up click.
- `resultCategory`/`goodCount`/`badCount`/`strikeoutCount`/`delta` are always server-computed at entry-creation time (never accepted from the client): `resultCategory` = "good" if `outcomeCategory === "defense"` else "bad"; `strikeoutCount` = 1 only if `outcomeType === "strikeout"`; for legacy `run_scored` entries `goodCount`/`badCount` are forced to `0`; for all other outcomes `delta` = goodCount − badCount − runsScored (see "Base-state simulation" for how `runsScored` is derived).
- **Base-state simulation (auto-calculated runs & LOB)**: there is no more manual runs-scored entry or a follow-up PATCH for players left on base — both are derived automatically from a simulated 1B/2B/3B occupancy that's tracked per-inning and carried at-bat to at-bat. `applyOutcomeToBaseState()` in `psisStore.ts` is the single entry point: `walk` uses forced-advancement rules (`applyWalk` — a runner only advances if the base behind them is occupied; a run only scores if the bases were loaded), `hit` uses `advanceRunners()` with a fixed base-advance count per `outcomeDetail` (`HIT_ADVANCE_BASES`: single=1, double=2, triple=3, home_run=4) applied uniformly to the batter and every existing runner (anyone pushed past 3rd scores). Defensive outs never move runners in this MVP model (no fielder's choice/sac/tag-up/steals — intentionally out of scope). The resulting `baseState` and `runsScored` are stored per-entry; `playersLeftOnBase` is computed the instant an at-bat's outs push the inning to 3 (count of still-occupied bases at that moment) and stored directly on that completing entry — no separate PATCH call. `Entry.runsScored`/`Entry.baseState`/`Entry.playersLeftOnBase` remain optional on the schema so pre-existing entries without them still validate.
- **Inning delta formula**: `Good − Bad − RunsScored`, computed per-entry at creation time (`delta = goodCount - badCount - runsScored`) so `inningDelta` (in `computeInningState`) is simply `sum(entry.delta)` over the inning's at-bats — no separate runs subtraction needed at the aggregation layer.
- **Backward compatibility**: entries created before the Outcome Wizard existed only have the legacy flat `result` field (no `outcomeCategory`/`outcomeType`). The `Entry` schema keeps both `result` (legacy, optional) and `outcomeCategory`/`outcomeType`/`outcomeDetail`/`playersLeftOnBase`/`runsScored`/`baseState` (optional) so all shapes validate; always render outcome text via `describeOutcome()`, never read `entry.result` or `entry.outcomeType` directly in UI code.
- Best/worst sequence rankings are computed on read (grouped by exact pitch sequence string, e.g. `FB-SL-CH`), not stored — cheap given expected data volume for a single team/season.

## Product

- **Home** — landing page explaining PSIS.
- **Tracker** (`/track`) — log a plate appearance via the EABR progressive click flow (Outcome → Defense/Offense → specific outcome → conditional follow-up → EABR reached), plus notes. Shows a running "recent log" sidebar, a Game Status Panel (inning number, outs, current delta, live Bases display, completed-inning scoreboard tiles), and an inning-complete summary + "Start Next Inning" control once 3 outs are reached.
- **Dashboard** (`/dashboard`) — entry count, total good/bad, average delta, top 5 / bottom 5 pitch sequences by average delta, and a recent entries table.

## Inning tracking

- At-bats accumulate within an inning until 3 defensive outs are recorded, then the inning is "complete" and a new one starts on the next logged at-bat.
- `outsAdded` per at-bat is server-computed from `outcomeCategory`/`outcomeType`/`outcomeDetail` (never trusted from the client): strikeout/fly_out/infield_out = 1; ground_out depends on its `outcomeDetail` (single_play = 1, double_play = 2, triple_play = 3); all offense outcomes = 0. It is capped so an inning's total outs never exceeds 3 (e.g. a ground_out/triple_play logged at 1 out only adds 2, not 3). Legacy top-level `infield_catch`/`double_play`/`triple_play` values map to 1/2/3 outs respectively for old entries.
- `inningNumber` is also server-computed: `resolveInningForNewAtBat` in `psisStore.ts` looks at the latest inning's entries and auto-advances to the next inning number only once that inning already has 3 outs. There is no persisted "current inning" record — inning state is always derived from the `entries` array on read via `computeInningState`/`computeLatestInningState`, consistent with how dashboard aggregates are computed on read rather than stored.
- `GET /innings/current` (`computeLatestInningState`) is for **display only** and does NOT auto-advance — it must still show the completed summary for the just-finished inning. Auto-advancing only happens in `resolveInningForNewAtBat`, called when creating a new entry. Keep this split: merging the two into one function caused a bug where the completed-inning summary was hidden immediately after the 3rd out.
- **Inning-complete summary is single-phase, no PATCH**: reaching 3 outs immediately reveals the final summary — Final Inning Delta, Runners Left On Base, "Inning N Complete", and "Start Next Inning" — with no LOB question and no confirmation button. `playersLeftOnBase` and `runsScored` are already computed and stored on the completing entry at creation time (see "Base-state simulation" in Architecture decisions), so there is nothing left to ask the user or persist post-hoc. This replaced an earlier two-phase "End Inning" confirmation UI and the `PATCH /entries/{id}` endpoint it relied on — both are gone; there is no PATCH route on `/entries` anymore.
- The Tracker page tracks a local `acknowledgedInning` state so clicking "Start Next Inning" previews the next inning's empty state (0/3 outs, delta 0) client-side without a server round trip — the real `inningNumber` assignment still happens server-side on the next submitted entry.
- Inning fields (`inningNumber`, `outsAdded`) are optional on the `Entry` schema so pre-existing entries created before this feature remain valid.
- `playersLeftOnBase` is computed server-side the instant an at-bat's outs push the inning to 3 and stored directly on that completing entry (see "Base-state simulation" in Architecture decisions) — no separate PATCH call. `computeInningState` looks at the completing at-bat's `playersLeftOnBase` for the inning-level LOB stat.
- **Recent Log scoping**: the Tracker's "Recent Log" sidebar list shows only the active inning's at-bats (`entry.inningNumber === inning.inningNumber`), not the full history — computed client-side in `track.tsx` (`recentLogEntries`), no API change. It clears the instant the inning-complete summary appears (as soon as the 3rd out is recorded), before "Start Next Inning" is even clicked — so it never shows stale/previous-inning at-bats. The separate "Last Entry" alert box above it is unaffected and still always shows the single most recent submission regardless of inning boundaries.

## User preferences

_None recorded yet._

## Gotchas

- After editing `artifacts/api-server/src/routes/*`, you must restart the `artifacts/api-server: API Server` workflow — it does not hot-reload route registration changes reliably.
- Use `listWorkflows()` to get the exact workflow name before calling `restart_workflow` — it's not the artifact title or slug (see memory: artifact-workflow-naming).
- Editing `data/psis_entries.json` directly requires reading it first (write tool enforces this), and requires an API server restart to pick up changes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

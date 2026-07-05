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
- **Outcome Wizard**: entries are logged through a guided decision tree instead of a flat outcome dropdown — Step 1: outcomeCategory (`defense`/`offense`), Step 2: outcomeType (specific outcome), Step 3 (conditional): `playersLeftOnBase` for fly_out/ground_out/double_play/triple_play, or `outcomeDetail` (double/triple) for extra_base_hit. See `artifacts/psis/src/lib/outcome.ts` for the wizard option lists and shared outcome-label rendering (`describeOutcome`), used by both Tracker and Dashboard so old and new entries render consistently.
- `resultCategory`/`goodCount`/`badCount`/`strikeoutCount`/`delta` are always server-computed at entry-creation time (never accepted from the client): `resultCategory` = "good" if `outcomeCategory === "defense"` else "bad"; `strikeoutCount` = 1 only if `outcomeType === "strikeout"`; `delta` = goodCount − badCount.
- **Backward compatibility**: entries created before the Outcome Wizard existed only have the legacy flat `result` field (no `outcomeCategory`/`outcomeType`). The `Entry` schema keeps both `result` (legacy, optional) and `outcomeCategory`/`outcomeType`/`outcomeDetail`/`playersLeftOnBase` (wizard, optional) so both shapes validate; always render outcome text via `describeOutcome()`, never read `entry.result` or `entry.outcomeType` directly in UI code.
- Best/worst sequence rankings are computed on read (grouped by exact pitch sequence string, e.g. `FB-SL-CH`), not stored — cheap given expected data volume for a single team/season.

## Product

- **Home** — landing page explaining PSIS.
- **Tracker** (`/track`) — log a plate appearance: pitcher/batter handedness, pitch sequence string, then the Outcome Wizard (Defense/Offense → specific outcome → conditional follow-up), notes. Shows a running "recent log" sidebar.
- **Dashboard** (`/dashboard`) — entry count, total good/bad, average delta, top 5 / bottom 5 pitch sequences by average delta, and a recent entries table.

## User preferences

_None recorded yet._

## Gotchas

- After editing `artifacts/api-server/src/routes/*`, you must restart the `artifacts/api-server: API Server` workflow — it does not hot-reload route registration changes reliably.
- Use `listWorkflows()` to get the exact workflow name before calling `restart_workflow` — it's not the artifact title or slug (see memory: artifact-workflow-naming).
- Editing `data/psis_entries.json` directly requires reading it first (write tool enforces this), and requires an API server restart to pick up changes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

# System Design

Application layers, responsibilities, and interaction patterns.

---

## Layer Model

```
┌─────────────────────────────────────────┐
│ Presentation (artifacts/psis)           │  React pages, wizard UI, dashboard
├─────────────────────────────────────────┤
│ API (artifacts/api-server/src/routes)   │  HTTP, validation glue, status codes
├─────────────────────────────────────────┤
│ Domain (lib/psis-game-logic)            │  Pure rules — outs, EABR, sessions
├─────────────────────────────────────────┤
│ Persistence (psisStore.ts)              │  JSON file read/write/append
└─────────────────────────────────────────┘
```

**Rule:** Domain logic never imports Express or `fs`. Routes never duplicate game rules inline.

---

## Module Responsibilities

### `artifacts/psis` (Frontend)

| Module | Responsibility |
|--------|----------------|
| `src/pages/track.tsx` | Outcome wizard, game status bar, scoreboard, session controls |
| `src/pages/dashboard.tsx` | Session list and detail dialog |
| `src/lib/outcome.ts` | Wizard option trees, `describeOutcome()` |
| Generated hooks | API calls via `@workspace/api-client-react` |

### `artifacts/api-server` (Backend)

| Module | Responsibility |
|--------|----------------|
| `src/routes/entries.ts` | POST/GET entries, server-side field computation |
| `src/routes/sessions.ts` | End session, list sessions |
| `src/routes/games.ts` | New game boundary |
| `src/routes/innings.ts` | Current inning display state |
| `src/routes/dashboard.ts` | Aggregates (legacy sequence fields unused by UI) |
| `src/routes/health.ts` | Health check |
| `src/lib/psisStore.ts` | File I/O, re-exports game logic |

### `lib/psis-game-logic`

Single source of truth for:

- Outs calculation and capping
- Base-state simulation and run advancement
- Inning aggregation (`computeInningState`)
- EABR unit and delta calculations
- RBI computation
- Session summary (`computeSessionSummary`)

---

## Session Flow

```
Coach opens Tracker
    → GET /api/innings/current (display state)
    → GET /api/entries (scoreboard, recent log)

Coach logs plate appearance
    → POST /api/entries
    → Server computes inningNumber, outsAdded, goodCount, badCount,
       delta, baseState, runsScored, playersLeftOnBase, rbi

Coach clicks "End Session" (≥1 completed inning)
    → POST /api/sessions/end
    → computeSessionSummary() over current gameId entries
    → Append to psis_sessions.json
    → startNewGame() bumps gameId

Coach reviews on Dashboard
    → GET /api/sessions
    → Dialog shows session.inningSummaries, session.atBats
```

---

## Game State Management

| Concept | Storage | Scope |
|---------|---------|-------|
| `gameId` | `psis_game_state.json` | Tracker live view |
| `inningNumber` | Derived per entry at creation | Per at-bat |
| `baseState` | Stored on each entry | Per at-bat |
| Entries | `psis_entries.json` | Append-only |
| Sessions | `psis_sessions.json` | Append-only |

**Key invariant:** `computeLatestInningState` (display) does **not** auto-advance innings. Only `resolveInningForNewAtBat` (entry creation) advances. Merging these caused a production bug (documented in `replit.md`).

**Legacy entries** without `gameId` are treated as `gameId: 1`.

---

## Persistence Strategy

- **Read:** Load full JSON array, filter/aggregate in memory
- **Write:** Read-modify-write entire file (acceptable at expected data volume)
- **Concurrency:** Single-process assumption; no file locking
- **Backup:** Operator responsibility via volume snapshots

---

## Error Handling

| Layer | Pattern |
|-------|---------|
| Routes | Zod parse → 400 with `{ message }` |
| Store | Propagate `fs` errors → 500 via Express error path |
| Frontend | React Query error states; toast notifications |
| Startup | `PORT` missing → process throws immediately |

---

## Logging

- **Library:** pino via `src/lib/logger.ts`
- **HTTP:** pino-http middleware (req id, method, url, status)
- **Production:** JSON logs to stdout (container-friendly)
- **Development:** pino-pretty transport
- **Config:** `LOG_LEVEL` env (default `info`)

---

## Configuration

| Variable | Required | Default | Used by |
|----------|----------|---------|---------|
| `PORT` | Yes | `8080` in Docker | API + Vite build |
| `NODE_ENV` | Recommended | `production` | Static serving, logging |
| `BASE_PATH` | Vite build | `/` | Asset paths, router base |
| `LOG_LEVEL` | No | `info` | pino |

See `.env.example` at repo root.

---

## Replit vs Docker Runtime

| Aspect | Replit | Docker Production |
|--------|--------|-------------------|
| Frontend | Separate Vite dev server | Express static |
| API | Separate artifact on 8080 | Same process |
| Routing | Platform router | Express `/api` + SPA fallback |
| Data | Workspace files | Volume mount recommended |

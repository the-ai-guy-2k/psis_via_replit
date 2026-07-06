# API Reference

REST API contract for PSIS. **Source of truth:** `lib/api-spec/openapi.yaml`

Base path: `/api`

---

## Health

### `GET /api/healthz`

Returns server health for monitoring and load balancers.

**Response 200:**

```json
{ "status": "ok" }
```

---

## Entries

### `GET /api/entries`

List all pitch sequence entries, most recent first.

**Response 200:** `Entry[]`

### `POST /api/entries`

Record a new plate appearance.

**Request body (`CreateEntryInput`):**

```json
{
  "pitchSequence": "FB-SL-CH",
  "handedness": "R",
  "outcomeCategory": "defense",
  "outcomeType": "strikeout",
  "notes": "Optional coach notes"
}
```

Offensive outcomes may include `outcomeDetail` (e.g. `hit` → `single`).

**Response 201:** `Entry` (server-computed fields included)

**Response 400:**

```json
{ "message": "Validation error description" }
```

**Server-computed fields (never accepted from client):**

- `resultCategory`, `goodCount`, `badCount`, `strikeoutCount`, `delta`
- `inningNumber`, `outsAdded`, `gameId`
- `baseState`, `runsScored`, `playersLeftOnBase`, `rbi`

---

## Dashboard

### `GET /api/dashboard`

Aggregates across all entries.

**Response 200:** `DashboardSummary`

Includes `entryCount`, `totalGood`, `totalBad`, `averageDelta`, `bestSequences`, `worstSequences`, `recentEntries`. Dashboard UI currently uses sessions instead of sequence widgets.

---

## Innings

### `GET /api/innings/current`

Current or most recently completed inning state for display.

**Response 200:** `InningState`

```json
{
  "inningNumber": 1,
  "gameId": 1,
  "outs": 2,
  "completed": false,
  "totalAtBats": 5,
  "goodCount": 3,
  "badCount": 2,
  "inningDelta": 1,
  "runsScored": 0,
  "playersLeftOnBase": 0,
  "baseState": { "firstBase": true, "secondBase": false, "thirdBase": false },
  "atBats": []
}
```

**Note:** Display-only — does not auto-advance innings.

---

## Games

### `POST /api/games/new`

Start a new game boundary. Bumps `gameId` without deleting historical entries.

**Response 200:**

```json
{ "currentGameId": 2 }
```

---

## Sessions

### `GET /api/sessions`

List saved pitching session summaries.

**Response 200:** `Session[]`

### `POST /api/sessions/end`

End the active session. Requires ≥1 completed inning in current game.

**Response 201:**

```json
{
  "session": { "...": "Session object" },
  "newGameId": 3
}
```

**Response 400:**

```json
{ "message": "Session must include at least 1 completed inning" }
```

---

## Error Responses

All validation failures return:

```json
{ "message": "Human-readable error string" }
```

HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation / business rule rejection |
| 500 | Unhandled server error |

---

## Schema Types

Full schemas defined in `openapi.yaml` components:

- `Entry`, `CreateEntryInput`
- `InningState`, `GameState`
- `Session`, `DashboardSummary`
- `OutcomeCategory`, `OutcomeType`, `OutcomeDetail`
- `BaseState`, `HealthStatus`, `ErrorResponse`

Regenerate TypeScript/Zod after changes:

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Future API Considerations

| Topic | Notes |
|-------|-------|
| Authentication | Add OpenAPI `securitySchemes`; middleware in `app.ts` |
| Pagination | `GET /entries` returns full array today — add cursor/limit if data grows |
| PATCH entries | Removed — entries are immutable after creation |
| Webhooks | Not planned |
| Versioning | Consider `/api/v1` prefix if breaking changes needed |
| OpenAPI export | Serve `/api/openapi.yaml` for external consumers |

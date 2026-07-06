# Implementing Features

Practical guide for where code goes and how to avoid breaking PSIS.

---

## Decision Tree

```
Is it a game rule (outs, runs, EABR units, sessions)?
  YES → lib/psis-game-logic + scenario tests
  NO ↓

Is it an API contract change (new field, endpoint)?
  YES → openapi.yaml → codegen → routes
  NO ↓

Is it UI only (layout, labels, new page using existing API)?
  YES → artifacts/psis
  NO ↓

Is it persistence (new file, schema migration)?
  YES → psisStore.ts + discuss with senior dev first
```

---

## Where New UI Belongs

| Item | Location |
|------|----------|
| New page | `artifacts/psis/src/pages/<name>.tsx` |
| Route registration | `artifacts/psis/src/App.tsx` (wouter `<Route>`) |
| Nav link | `artifacts/psis/src/components/layout.tsx` |
| Wizard outcomes | `artifacts/psis/src/lib/outcome.ts` |
| Shared UI components | `artifacts/psis/src/components/` |
| API calls | Generated hooks from `@workspace/api-client-react` |

**Display rule:** Always use `describeOutcome(entry)` for outcome text — never read legacy `entry.result` directly.

---

## Where API Changes Belong

| Step | File |
|------|------|
| 1. Contract | `lib/api-spec/openapi.yaml` |
| 2. Codegen | `pnpm --filter @workspace/api-spec run codegen` |
| 3. Route handler | `artifacts/api-server/src/routes/<name>.ts` |
| 4. Register router | `artifacts/api-server/src/routes/index.ts` |
| 5. Validation glue | Use generated Zod types from `@workspace/api-zod` |

**Server-computed fields** (never accept from client): `goodCount`, `badCount`, `delta`, `outsAdded`, `inningNumber`, `gameId`, `baseState`, `runsScored`, `rbi`, `playersLeftOnBase`.

---

## Where Shared Logic Belongs

| Logic type | Location |
|------------|----------|
| Game / EABR rules | `lib/psis-game-logic/src/index.ts` |
| File read/write | `artifacts/api-server/src/lib/psisStore.ts` |
| Outcome labels (UI) | `artifacts/psis/src/lib/outcome.ts` |
| API request glue | `artifacts/api-server/src/routes/entries.ts` |

**Never** put outs/delta/fraction math in React components or route handlers.

---

## How to Add an Endpoint

See [Common_Tasks.md](./Common_Tasks.md#add-an-api-endpoint) for step-by-step.

Summary:

1. Add path + schemas to `openapi.yaml`
2. Run codegen
3. Create or extend route file
4. Mount in `routes/index.ts`
5. Use hook in frontend if needed

---

## How to Add a Page

1. Create `artifacts/psis/src/pages/my-page.tsx`
2. Add `<Route path="/my-page" component={MyPage} />` in `App.tsx`
3. Add nav link in layout if user-facing
4. Use existing hooks — do not `fetch()` manually unless necessary

---

## How to Update Data Models

1. Update schema in `openapi.yaml` (`Entry`, `CreateEntryInput`, etc.)
2. Run codegen
3. Fix TypeScript errors in routes and frontend
4. If stored on disk: ensure `psisStore.ts` read/write handles new fields
5. Keep old fields optional for backward compatibility when possible

---

## How to Document Changes

| Audience | Document |
|----------|----------|
| Developers | `docs/developer/` or this folder |
| API change | `docs/developer/API_Reference.md` |
| Operator impact | `docs/operator/` |
| Manager impact | `docs/manager/` |
| Architecture decision | `replit.md` (significant behavior changes) |

---

## How to Avoid Breaking Existing Functionality

| Risk | Prevention |
|------|------------|
| EABR regression | `pnpm run test:psis` before commit |
| API contract drift | Always codegen after OpenAPI edits |
| Legacy entries break | Keep old enum values in schema; use `describeOutcome()` |
| Inning display bug | Never merge `computeLatestInningState` with `resolveInningForNewAtBat` |
| Client-trusted counts | Server always recomputes good/bad/delta |
| Wizard/server mismatch | Update both `outcome.ts` and `entries.ts` validation |

---

## Out of Scope (Do Not Build Without Explicit Request)

From `replit.md`:

- User authentication
- Cloud database migration
- AI recommendations
- Multi-team roster system
- Pitching training tool / stat explorer

If an ACI says "do not build," respect it.

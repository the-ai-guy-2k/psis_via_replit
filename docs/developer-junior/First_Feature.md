# First Feature

A guided exercise: add a "Coach name" notes field to the session display on the Dashboard.

**Difficulty:** Intermediate junior (with mentor)  
**Time:** 2–4 hours  
**Touches:** OpenAPI → API → UI (game logic unchanged)

> **Note:** This exercise teaches the **full path**. Your mentor may assign a smaller variant. Do not merge without review.

---

## The Scenario

Product wants coaches to see **who recorded** a session on the Dashboard session list. We will add an optional `recordedBy` text field when ending a session.

Because this touches API + UI, follow every step and ask your mentor at each layer.

---

## What You Will Learn

- Update OpenAPI contract
- Run codegen
- Update backend route
- Update React Dashboard
- Run tests throughout

---

## Step 0 — Baseline

```bash
pnpm run test:psis   # Must PASS
```

Create branch:

```bash
git checkout -b feature/session-recorded-by
```

---

## Step 1 — Update the API Contract

**File:** `lib/api-spec/openapi.yaml`

Find the `Session` schema under `components/schemas`. Add:

```yaml
recordedBy:
  type: string
  description: Optional name of coach who recorded the session
```

Find `POST /sessions/end` — add optional request body if your mentor directs, or pass `recordedBy` as query param per team convention.

**Ask mentor** to review OpenAPI change before codegen.

---

## Step 2 — Run Codegen

```bash
pnpm --filter @workspace/api-spec run codegen
pnpm run typecheck
```

This regenerates Zod types and React hooks. **Do not edit `generated/` folders by hand.**

---

## Step 3 — Update Backend

**File:** `artifacts/api-server/src/routes/sessions.ts`

In the `endSession` handler:

1. Read optional `recordedBy` from request body
2. Pass it to `computeSessionSummary` or attach to Session object before save

**File:** `lib/psis-game-logic/src/index.ts`

If `Session` type needs the field — add optional `recordedBy?: string` to summary builder return object.

**Important:** If you change game-logic types, run tests after.

---

## Step 4 — Run Tests

```bash
pnpm run test:psis
```

If you only added an optional display field and did not change math — tests should still **PASS**.

If you changed `computeSessionSummary` — you may need a new scenario test. **Ask mentor.**

---

## Step 5 — Update Frontend

**File:** `artifacts/psis/src/pages/dashboard.tsx`

1. Find session list row component
2. Display `session.recordedBy` if present: e.g. "Recorded by: Coach Smith"
3. On End Session flow in `track.tsx` — add optional text input for coach name
4. Pass value in `useEndSession()` mutation body

Use generated hooks — do not write raw `fetch()` if a hook exists.

---

## Step 6 — Verify

| Check | How |
|-------|-----|
| typecheck | `pnpm run typecheck` |
| tests | `pnpm run test:psis` |
| browser | End a session with name → see it on Dashboard |
| CI | Push and watch GitHub Actions |

---

## Step 7 — Document

Tell mentor to update if user-visible:

- `docs/manager/` if managers need to know
- No operator change unless deploy changes

---

## Step 8 — Commit

```bash
git add lib/api-spec/openapi.yaml
git add artifacts/api-server/src/routes/sessions.ts
git add artifacts/psis/src/pages/
# plus generated files from codegen
git commit -m "Add optional recordedBy field to pitching sessions."
```

---

## Checklist

- [ ] OpenAPI updated
- [ ] Codegen run
- [ ] Backend saves field
- [ ] Dashboard displays field
- [ ] test:psis PASS
- [ ] Mentor approved
- [ ] CI green

---

## If This Feels Too Hard

That is normal. Ask mentor to:

- Pair program one layer at a time
- Assign a smaller feature (UI-only label change)
- Defer OpenAPI until you have done First Bug Fix

---

## Graduate Path

After completing this with mentor sign-off, use [Mid-Level Implementing Features](../developer-mid/Implementing_Features.md) for future work.

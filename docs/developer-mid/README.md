# PSIS Mid-Level Developer Guide

**Implementation-focused documentation for developers who will write code day to day.**

---

## Intended Audience

You are a **mid-level software engineer** who:

- Understands TypeScript, React, REST APIs, and Git
- Has **not** worked on PSIS before
- Needs to become productive quickly without reading every architecture decision

You are **not** the primary audience for:

- [Senior developer docs](../developer/README.md) — deeper architecture and system design
- [Operator docs](../operator/README.md) — Docker deployment for IT staff
- [Manager docs](../manager/README.md) — business and operations oversight

---

## Expected Experience Level

| Skill | Expected |
|-------|----------|
| TypeScript / JavaScript | Comfortable |
| React + hooks | Comfortable |
| REST APIs | Comfortable |
| pnpm / npm workspaces | Basic familiarity |
| Docker | Awareness (CI builds images; you rarely run Docker locally) |
| Baseball / EABR | **Not required** — [Working_With_EABR.md](./Working_With_EABR.md) teaches what you need |

---

## Learning Path

```
Day 1     Getting_Started.md + Repository_Cheat_Sheet.md
Day 2     Development_Workflow.md + Testing_Guide.md
Day 3+    Implementing_Features.md + Working_With_EABR.md
Ongoing   Common_Tasks.md + Debugging_Guide.md + Developer_FAQ.md
```

**Goal:** Run tests, make a small change, and understand where code lives within your first two days.

---

## Recommended Reading Order

| # | Document | Time | Purpose |
|---|----------|------|---------|
| 1 | [Getting_Started.md](./Getting_Started.md) | 30–60 min | Clone, install, run tests |
| 2 | [Repository_Cheat_Sheet.md](./Repository_Cheat_Sheet.md) | 15 min | Quick navigation |
| 3 | [Development_Workflow.md](./Development_Workflow.md) | 20 min | How work flows to production |
| 4 | [Testing_Guide.md](./Testing_Guide.md) | 20 min | Quality gates |
| 5 | [Implementing_Features.md](./Implementing_Features.md) | 30 min | Where to put code |
| 6 | [Working_With_EABR.md](./Working_With_EABR.md) | 30 min | Domain rules (if touching game logic) |
| 7 | [Common_Tasks.md](./Common_Tasks.md) | Reference | Step-by-step recipes |
| 8 | [Debugging_Guide.md](./Debugging_Guide.md) | Reference | When things break |
| 9 | [Developer_FAQ.md](./Developer_FAQ.md) | Reference | Quick answers |

---

## Relationship to Other Docs

| Need | Read |
|------|------|
| "Why is it built this way?" | [../developer/Architecture_Overview.md](../developer/Architecture_Overview.md) |
| "What are all the API fields?" | [../developer/API_Reference.md](../developer/API_Reference.md) |
| "What's the CI pipeline?" | [../developer/CI_CD_Pipeline.md](../developer/CI_CD_Pipeline.md) |
| Historical decisions | `replit.md` (repo root) |

---

## Quick Sanity Check

Before your first PR, you should be able to answer:

- [ ] Where does game logic live?
- [ ] What command runs scenario tests?
- [ ] What file is the API contract source of truth?
- [ ] What happens when I merge to `main`?

If not, finish [Getting_Started.md](./Getting_Started.md) first.

---

## First Feature Exercise (Recommended)

After setup, try this read-only orientation (no commit required):

1. Open `artifacts/psis/src/pages/track.tsx` — find the Outcome wizard state
2. Open `artifacts/api-server/src/routes/entries.ts` — find POST handler
3. Open `lib/psis-game-logic/src/index.ts` — find `computeEabrUnits`
4. Run `pnpm run test:psis` and open `artifacts/psis/public/reports/PSIS_Test_Report.md`

This traces UI → API → logic → tests in 15 minutes.

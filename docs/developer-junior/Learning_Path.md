# Learning Path

A day-by-day roadmap for junior developers on PSIS.

---

## Before You Start

- [ ] Clone the repository (see [Git_and_GitHub_Basics.md](./Git_and_GitHub_Basics.md))
- [ ] Install Node.js 24 and pnpm (see [Getting Started](../developer-mid/Getting_Started.md))
- [ ] Tell your mentor you are starting the junior learning path

---

## Day 1 — Look Around (No Code Changes)

**Goal:** Know what PSIS is and run the safety tests.

| Task | Document / Action |
|------|-------------------|
| Read welcome + tour | [Project_Tour.md](./Project_Tour.md) |
| Learn what PSIS solves | [Understanding_PSIS.md](./Understanding_PSIS.md) |
| Look up unfamiliar words | [Glossary.md](./Glossary.md) |
| Run scenario tests | `pnpm run test:psis` — expect **PASS** |
| Skim the Tracker in browser | Ask mentor for PSIS URL or run locally |

**Success:** You can say in one sentence what PSIS does, and tests pass.

**Windows note:** If `pnpm install` fails, ask mentor about WSL or `npx pnpm install --ignore-scripts`. Tests can still run.

---

## Day 2 — Understand Structure and Rules

**Goal:** Know where code lives and what EABR means.

| Task | Document / Action |
|------|-------------------|
| Re-read Project Tour | Draw your own folder diagram on paper |
| Learn EABR basics | [Understanding_EABR.md](./Understanding_EABR.md) |
| Read safe change rules | [Safe_Code_Changes.md](./Safe_Code_Changes.md) |
| Open three files side by side | `track.tsx`, `entries.ts`, `psis-game-logic/index.ts` |
| Read common mistakes | [Common_Mistakes.md](./Common_Mistakes.md) |

**Success:** You can point to frontend, backend, and game logic folders.

---

## Day 3 — Git and First Bug Fix

**Goal:** Make your first small change with mentor support.

| Task | Document / Action |
|------|-------------------|
| Learn Git basics for PSIS | [Git_and_GitHub_Basics.md](./Git_and_GitHub_Basics.md) |
| Complete guided bug fix | [First_Bug_Fix.md](./First_Bug_Fix.md) |
| Run tests before and after | `pnpm run test:psis` |
| Ask mentor to review your PR | Do not merge alone on first try |

**Success:** Tests still PASS; mentor approves your change.

---

## Day 4 — First Feature

**Goal:** Follow the full path for a tiny feature.

| Task | Document / Action |
|------|-------------------|
| Complete guided feature | [First_Feature.md](./First_Feature.md) |
| Run tests + typecheck | With mentor help on Windows/WSL |
| Watch CI on GitHub | [Git_and_GitHub_Basics.md](./Git_and_GitHub_Basics.md) |

**Success:** Feature works; tests PASS; CI green (with mentor).

---

## Day 5 — Review and Reflect

| Task | Action |
|------|--------|
| List what you learned | Write 5 bullets |
| List what confused you | Ask mentor |
| Re-read Common Mistakes | Which ones almost happened to you? |
| Check graduation checklist | [README.md](./README.md) |

---

## Week 2+ — Build Confidence

| Focus | Resource |
|-------|----------|
| More small tasks | Mentor-assigned tickets |
| Deeper workflows | [Mid-Level Getting Started](../developer-mid/Getting_Started.md) |
| Step-by-step recipes | [Common Tasks](../developer-mid/Common_Tasks.md) |
| Debugging | [Debugging Guide](../developer-mid/Debugging_Guide.md) |

---

## Graduation to Mid-Level Docs

You are ready when:

1. You completed First Bug Fix **and** First Feature
2. You understand scenario tests as your safety net
3. You know **not** to edit generated files or game logic without tests
4. Your mentor agrees you can use [developer-mid/](../developer-mid/README.md) as your main reference

---

## If You Fall Behind

That is OK. Repeat a day. Pair with your mentor. **Never skip tests** to catch up faster.

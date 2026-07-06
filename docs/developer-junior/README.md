# PSIS Junior Developer Guide

Welcome to PSIS development.

---

## Welcome

You belong here. PSIS looks like a big project at first — that is normal. This documentation is written **for you**: someone who knows programming basics but has not worked on a production codebase like this before.

**Mistakes are expected.** That is why we have tests, code review, and guides. Your job is to learn the process, ask questions early, and make small safe changes before big ones.

---

## Intended Audience

You are a **junior developer** if you:

- Know some TypeScript, JavaScript, or React from courses or tutorials
- Are new to **real team projects** with multiple folders and shared libraries
- Have **not** deployed Docker or designed system architecture before
- Want step-by-step guidance, not assumptions

You are **not** the audience for [mid-level docs](../developer-mid/README.md) or [senior docs](../developer/README.md) **yet** — you will graduate there when ready.

---

## Learning Objectives

By the end of this guide, you should be able to:

1. Explain what PSIS does in plain language
2. Find the frontend, backend, and game logic in the repo
3. Run scenario tests and understand PASS vs FAIL
4. Make a small, safe code change with tests
5. Know when to ask for help instead of guessing

---

## Recommended Reading Order

| # | Document | Time |
|---|----------|------|
| 1 | [Learning_Path.md](./Learning_Path.md) | 5 min — your roadmap |
| 2 | [Project_Tour.md](./Project_Tour.md) | 20 min — where things live |
| 3 | [Understanding_PSIS.md](./Understanding_PSIS.md) | 15 min — what the app does |
| 4 | [Glossary.md](./Glossary.md) | Reference — look up words |
| 5 | [Understanding_EABR.md](./Understanding_EABR.md) | 20 min — scoring rules |
| 6 | [Safe_Code_Changes.md](./Safe_Code_Changes.md) | 15 min — rules before editing |
| 7 | [Git_and_GitHub_Basics.md](./Git_and_GitHub_Basics.md) | 20 min — how we save work |
| 8 | [First_Bug_Fix.md](./First_Bug_Fix.md) | 1–2 hours — guided practice |
| 9 | [First_Feature.md](./First_Feature.md) | 2–4 hours — guided practice |
| 10 | [Common_Mistakes.md](./Common_Mistakes.md) | Reference — when stuck |

---

## Estimated Learning Timeline

| Week | Focus |
|------|-------|
| **Week 1** | Read docs, run tests, explore repo (no code changes) |
| **Week 2** | First Bug Fix exercise with mentor review |
| **Week 3** | First Feature exercise with mentor review |
| **Week 4+** | Move to [Mid-Level Developer Guide](../developer-mid/README.md) |

Everyone learns at a different pace. **Slow is fine** if you are careful.

---

## When You Are Ready to Graduate

Move to mid-level documentation when you can:

- [ ] Run `pnpm run test:psis` without looking up the command
- [ ] Explain why game logic lives in `lib/psis-game-logic`
- [ ] Complete First Bug Fix and First Feature with mentor sign-off
- [ ] Read a CI failure log and know which step failed

---

## Getting Help

| Question type | Ask |
|---------------|-----|
| "What does this word mean?" | [Glossary](./Glossary.md) or mentor |
| "Where is X in the code?" | [Project_Tour](./Project_Tour.md) |
| "Am I stuck > 30 min?" | **Mentor** — bring test output and `git diff` |
| "Did I break EABR?" | Run `pnpm run test:psis` — then ask if FAIL |
| "Is this too big for me?" | **Always ask** — better than a broken build |

### Mentor escalation card (copy/paste)

```
I'm stuck on: [one sentence]
I tried: [what you did]
Tests: PASS / FAIL
Files I changed: [list]
Question: [specific question]
```

---

## Other Documentation (Not for Day 1)

| Folder | Who |
|--------|-----|
| [docs/developer-mid/](../developer-mid/README.md) | You — **next step** after this guide |
| [docs/developer/](../developer/README.md) | Senior engineers |
| [docs/operator/](../operator/README.md) | IT staff |
| [docs/manager/](../manager/README.md) | Managers |

You do not need those on your first day.

# Safe Code Changes

How to edit PSIS without breaking things — rules for junior developers.

---

## The Golden Rules

1. **Run tests before you start** — know the baseline is PASS
2. **Make small changes** — one thing at a time
3. **Run tests after every change** — catch mistakes early
4. **Ask if unsure** — especially for scoring math
5. **Never edit generated files** — files in `generated/` folders

---

## The Safety Net: Scenario Tests

```bash
pnpm run test:psis
```

| Result | Meaning |
|--------|---------|
| **PASS** | Scoring rules still work (14 scenarios, 96 checks) |
| **FAIL** | Something broke — **stop and fix or ask for help** |

Run tests:

- Before you edit code
- After you edit code
- Before you ask for PR review

**Do not** change test expected values to force PASS without mentor approval.

---

## What Is Safe to Change (With Mentor)

| Safe for juniors | Examples |
|------------------|----------|
| UI text and labels | Button text, page titles, help text |
| CSS / layout spacing | Tailwind classes on pages |
| Comments and docs | `docs/` folder |
| Small display bugs | Wrong label, typo on Home page |

| Ask mentor first | Examples |
|------------------|----------|
| API endpoints | New URLs, new fields |
| Game logic | Outs, delta, fraction, RBI |
| Data files structure | `psis_entries.json` shape |
| CI / Docker | `.github/`, `Dockerfile` |

| Do not touch alone | Examples |
|--------------------|----------|
| `lib/*/generated/` | Auto-generated code |
| EABR formulas | Without tests + approval |
| `pnpm-workspace.yaml` | Breaks installs |

---

## The Layer Rule

**Put code in the right floor of the building:**

| If you are changing… | Edit here |
|----------------------|-----------|
| What the screen looks like | `artifacts/psis/` |
| What the server returns | `artifacts/api-server/src/routes/` |
| Scoring math | `lib/psis-game-logic/` |
| API menu | `lib/api-spec/openapi.yaml` |

**Wrong layer = bugs.** Example: putting outs math in React instead of `psis-game-logic`.

---

## Step-by-Step Safe Change Process

```
1. Create a git branch (mentor can help)
2. pnpm run test:psis          → save result (should be PASS)
3. Make ONE small edit
4. pnpm run test:psis          → still PASS?
5. If UI change: look at browser
6. Commit with clear message
7. Push and ask for review
```

---

## How to Avoid Breaking Existing Functionality

| Do | Don't |
|----|-------|
| Read nearby code first | Copy-paste from internet |
| Match existing style | Rename random things |
| Keep old data working | Delete schema fields |
| Use `describeOutcome()` for display | Read `entry.result` directly |

---

## When to Ask for Help

Ask **immediately** if:

- Tests fail and you do not know why
- You think you need to change `psis-game-logic`
- CI fails on GitHub and you do not understand the log
- You are about to edit a `generated/` folder
- Your change touches more than 3 files

Ask **soon** if:

- You have been stuck for more than 30 minutes
- You are not sure which file to edit
- You need to run `codegen` (mentor should walk you through first time)

**Asking is not failure.** It is part of the job.

---

## Windows Developers

Full `pnpm run build` may fail on Windows. That is OK:

- You can still run `pnpm run test:psis` on Windows
- Your mentor or CI will verify the full build

See [Getting Started](../developer-mid/Getting_Started.md).

---

## Next Steps

- Practice: [First_Bug_Fix.md](./First_Bug_Fix.md)
- Avoid traps: [Common_Mistakes.md](./Common_Mistakes.md)

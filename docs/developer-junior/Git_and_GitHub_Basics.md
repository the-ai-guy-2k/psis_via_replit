# Git and GitHub Basics

Only the Git workflow you need for PSIS — nothing extra.

---

## What Are Git and GitHub?

| Tool | Simple explanation |
|------|-------------------|
| **Git** | Saves snapshots of your code on your computer |
| **GitHub** | Website that stores the team's copy and runs automated tests |

PSIS repo: https://github.com/the-ai-guy-2k/psis_via_replit.git

---

## Clone (First Time Only)

Download the project:

```bash
git clone https://github.com/the-ai-guy-2k/psis_via_replit.git
cd psis_via_replit
```

You already did this if you have the folder on your machine.

---

## Pull (Get Latest Team Changes)

Before starting new work each day:

```bash
git checkout main
git pull origin main
```

This downloads what teammates merged. **Always pull before creating a branch.**

---

## Branch Awareness

| Branch | Meaning |
|--------|---------|
| `main` | The real version — merging here triggers CI and Docker publish |
| `your-name/fix-thing` | Your safe workspace for changes |

Create a branch (with mentor first few times):

```bash
git checkout -b your-name/short-description
```

**Never push directly to `main` alone** until mentor says you are ready.

---

## See What You Changed

```bash
git status          # which files changed
git diff            # exact line changes
```

---

## Commit (Save a Snapshot)

After a small working change:

```bash
git add path/to/files
git commit -m "Short message explaining why you changed it."
```

**Good message:** `Fix typo on Home page meta description`  
**Bad message:** `stuff`, `fix`, `asdf`

---

## Push (Upload to GitHub)

```bash
git push origin your-name/short-description
```

Then ask mentor to help open a **Pull Request (PR)** on GitHub.

---

## Pull Request (PR)

A PR asks the team: "Please review and merge my changes."

1. You push your branch
2. Open PR on GitHub: base = `main`, compare = your branch
3. Mentor reviews
4. CI runs tests automatically
5. If approved and CI green → merge

**You do not need to understand every CI step yet** — just know green = good, red = bad.

---

## Reading GitHub Actions (CI)

1. Go to https://github.com/the-ai-guy-2k/psis_via_replit/actions
2. Click latest **PSIS PA Validation** run
3. Red X = failed step — click it to read logs
4. Green check = all passed

### Common failed steps for juniors

| Step | Usually means |
|------|---------------|
| Run scenario tests | Code broke EABR — run tests locally |
| Build application | TypeScript error — run typecheck |
| Install dependencies | Ask DevOps — not your fault usually |

See [Common_Mistakes.md](./Common_Mistakes.md).

---

## Undo Mistakes (Beginner)

**Undo uncommitted changes to one file:**

```bash
git checkout -- path/to/file
```

**Undo all uncommitted changes (careful!):**

```bash
git checkout .
```

Ask mentor before using advanced commands like `reset`.

---

## What You Do NOT Need Yet

- `rebase`, `cherry-pick`, `submodules`
- Force push (`push --force`)
- Editing `.github/workflows/`

---

## Daily Git Habit

```
morning:  git checkout main && git pull
work:     git checkout -b my-branch
          (make small change, test, commit)
evening:  git push, open PR, ask for review
```

---

## Next Step

[First_Bug_Fix.md](./First_Bug_Fix.md) uses this workflow in practice.

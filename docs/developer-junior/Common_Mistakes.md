# Common Mistakes

Mistakes new developers make on PSIS — and how to recover.

---

## 1. Editing the Wrong Layer

**Mistake:** Putting scoring math in `track.tsx` or `entries.ts` instead of `psis-game-logic`.

**Symptom:** Tests fail, or UI shows different numbers than API.

**Fix:** Move math to `lib/psis-game-logic`. Run `pnpm run test:psis`.

---

## 2. Skipping Tests

**Mistake:** "It's just a small change" — no `pnpm run test:psis`.

**Symptom:** CI fails; EABR regression reaches coaches.

**Fix:** Always run tests before push. Make it a habit.

---

## 3. Changing EABR Rules Accidentally

**Mistake:** Tweaking a number in game logic without understanding EABR.

**Symptom:** Scenario test FAIL with assertion name about outs, delta, or RBI.

**Fix:** Read [Understanding_EABR.md](./Understanding_EABR.md). Undo change. Ask mentor.

---

## 4. Editing Generated Files

**Mistake:** Editing `lib/api-zod/src/generated/` or `lib/api-client-react/src/generated/`.

**Symptom:** Changes disappear on next codegen; weird TypeScript errors.

**Fix:** Undo. Edit `openapi.yaml` instead. Run `pnpm --filter @workspace/api-spec run codegen`.

---

## 5. Ignoring CI Failures

**Mistake:** Merging or moving on when GitHub Actions is red.

**Symptom:** Broken `main`, broken Docker image.

**Fix:** Click failed step, read log, fix or ask mentor. **Never ignore red CI.**

---

## 6. Changing Test Expectations to Force PASS

**Mistake:** Editing expected values in `test-psis-scenarios.ts` to match wrong behavior.

**Symptom:** Tests pass but app is wrong.

**Fix:** Undo test changes. Fix the logic. Tests define truth — get approval before changing them.

---

## 7. Working on `main` Without Pulling

**Mistake:** Stale code, merge conflicts, surprise CI failures.

**Fix:** `git pull origin main` before starting.

---

## 8. Huge PRs

**Mistake:** 20 files changed in first PR.

**Symptom:** Hard review, hard to debug.

**Fix:** Small PRs — one bug fix or one tiny feature.

---

## 9. Not Asking for Help

**Mistake:** Stuck for hours, growing frustration.

**Fix:** Ask at 30 minutes. Bring: what you tried, test output, `git diff`.

---

## 10. Assuming Windows Build = CI

**Mistake:** "Build failed on my PC, the project is broken."

**Fix:** Windows often cannot full-build PSIS. Run tests locally; let CI build. Use WSL if mentor sets it up.

---

## Recovery Cheat Sheet

| Situation | Command / Action |
|-----------|------------------|
| Undo file | `git checkout -- file` |
| Undo everything uncommitted | `git checkout .` |
| Tests fail | Read failure name, undo recent edit |
| CI fail | Open Actions log, find red step |
| Completely lost | Ask mentor — no shame |

---

## Prevention

Read [Safe_Code_Changes.md](./Safe_Code_Changes.md) before every edit session.

# Testing Guide

How to test PSIS changes and what quality gates apply.

---

## Test Types in PSIS

| Type | Tool | When |
|------|------|------|
| **Scenario tests** | `pnpm run test:psis` | Game logic, entries, sessions |
| **Typecheck** | `pnpm run typecheck` | All TypeScript changes |
| **Build** | `pnpm run build` | Full compile validation |
| **CI smoke tests** | GitHub Actions + Docker | Every `main` push |
| Unit tests (Jest/Vitest) | None separate | Scenarios are the integration gate |

---

## Scenario Tests (Primary)

### Run

```bash
export PORT=8080 BASE_PATH=/ NODE_ENV=production
pnpm run test:psis
```

### What they cover

- Outs calculation and 3-out cap
- Run advancement (hits, walks)
- LOB at inning completion
- Good/bad EABR classification
- Delta and fraction
- Inning auto-advance
- New Game `gameId` scoping
- RBI and bad-unit penalties
- End Session rules

**Current:** 14 scenarios, 96 assertions

### Where they live

```
scripts/src/test-psis-scenarios.ts
```

Imports `@workspace/psis-game-logic` directly — **no server, no files**.

### Reports generated

```
artifacts/psis/public/reports/PSIS_Test_Report.md
artifacts/psis/public/reports/PSIS_Test_Report.json
```

Dashboard links to these for download.

---

## When to Create New Tests

Add a scenario when you:

- Change `lib/psis-game-logic/src/index.ts`
- Change how `entries.ts` assembles server-computed fields
- Fix a bug that scenarios did not catch

### How to add a scenario

1. Open `scripts/src/test-psis-scenarios.ts`
2. Follow existing `simulateAtBat` / assertion patterns
3. Add descriptive scenario name
4. Run `pnpm run test:psis` — must PASS
5. Commit updated report files if your team includes them in PRs

**Do not change expected assertion values** to make tests pass without explicit approval (ACIs call this "scenario test truth").

---

## Regression Expectations

| Change | Minimum test |
|--------|--------------|
| Game logic | New or updated scenario + full suite PASS |
| API validation only | typecheck + manual API test |
| UI only | typecheck; manual Tracker/Dashboard check |
| OpenAPI schema | codegen + typecheck + build |

---

## Validating EABR Logic

1. Read [Working_With_EABR.md](./Working_With_EABR.md)
2. Implement in `psis-game-logic`
3. Add scenario with known inputs/outputs
4. Run `pnpm run test:psis`
5. Review `PSIS_Test_Report.md` for PASS/PARTIAL/FAIL detail

**Never validate EABR only in the browser** — scenario tests are the regression gate.

---

## Smoke Testing

### Local (after Docker build, WSL/Linux)

```bash
docker build -t psis:local .
docker run -d --name psis-test -p 8080:8080 -e PORT=8080 -e NODE_ENV=production psis:local
curl http://localhost:8080/api/healthz
curl -o /dev/null -w "%{http_code}" http://localhost:8080/
curl -o /dev/null -w "%{http_code}" http://localhost:8080/track
docker stop psis-test && docker rm psis-test
```

### CI (automatic)

Same checks on ports 18080/18081 — see [../developer/CI_CD_Pipeline.md](../developer/CI_CD_Pipeline.md).

---

## CI Validation

Every `main` push runs:

1. `pnpm install --frozen-lockfile`
2. `pnpm run test:psis` ← **your tests run here**
3. `pnpm run build`
4. `docker build` (runs tests again inside Dockerfile)
5. Container smoke tests
6. Publish to Docker Hub
7. Pull + smoke test published image

**If scenario tests fail, nothing ships.**

---

## Expected Quality Gates

| Gate | Required for merge |
|------|-------------------|
| `test:psis` PASS | Yes (game logic / entries changes) |
| `typecheck` PASS | Yes |
| `build` PASS | Yes (CI enforces) |
| CI workflow green | Yes for `main` |
| Manual Tracker test | Recommended for UI changes |

---

## Quick Troubleshooting Tests

| Symptom | Check |
|---------|-------|
| Scenario FAIL | Read assertion detail in console output |
| typecheck errors after OpenAPI edit | Run codegen |
| build fails on Windows | Use WSL — not a test failure |
| CI fails at install | `minimumReleaseAge` — see Debugging Guide |

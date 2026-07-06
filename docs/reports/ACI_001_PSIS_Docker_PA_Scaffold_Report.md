# ACI-001 — PSIS Docker PA Scaffold Report

**Date:** 2026-07-06  
**Branch:** `main`  
**Repo:** https://github.com/the-ai-guy-2k/psis_via_replit.git  
**Local path:** `C:\Users\tim\Documents\business_related\The_AI_Guy\nebula\2 - TAIG2K_SOFTWARE\PSIS`  
**Docker Hub target (future):** `taig2k/pitching_sequence_intellegence_system_psis`

---

## Minority Report

ACI-001 scaffolded a production Docker artifact for PSIS: a multi-stage `Dockerfile`, `.dockerignore`, `.env.example`, and Express static/SPA serving for the Vite frontend. Scenario tests pass locally. Full `pnpm run build` and all Docker validation (`docker build`, `docker run`, health/frontend checks) are **deferred to the next ACI via GitHub Actions** — the operator laptop does not have Docker installed, and Docker activities will run in CI only.

---

## Files Created

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage Node 24 image: pnpm install → `test:psis` → `build` → production CMD |
| `.dockerignore` | Excludes `.git`, `node_modules`, `.agents`, `attached_assets`, logs, env files |
| `.env.example` | Documents `PORT`, `NODE_ENV`, `LOG_LEVEL`, `BASE_PATH` |
| `docs/reports/ACI_001_PSIS_Docker_PA_Scaffold_Report.md` | This report |

## Files Modified

| File | Change |
|------|--------|
| `artifacts/api-server/src/app.ts` | Production static serving from `artifacts/psis/dist/public` + SPA fallback for non-`/api` routes |

---

## Commands Run

```powershell
cd "C:\Users\tim\Documents\business_related\The_AI_Guy\nebula\2 - TAIG2K_SOFTWARE\PSIS"

# Dependency install (Windows — preinstall uses sh, skipped with --ignore-scripts)
npx --yes pnpm@10 install --ignore-scripts

# Scenario tests
$env:PORT='8080'; $env:BASE_PATH='/'; $env:NODE_ENV='production'
npx --yes pnpm@10 run test:psis

# Full build (attempted on Windows — see Issues)
npx --yes pnpm@10 run build
```

**Not run (deferred to GitHub Actions ACI):**

```bash
docker build -t taig2k/pitching_sequence_intellegence_system_psis:local .
docker run --rm -p 8080:8080 -e PORT=8080 -e NODE_ENV=production taig2k/pitching_sequence_intellegence_system_psis:local
curl http://localhost:8080/api/healthz
```

---

## Validation Results

### `pnpm run test:psis` — PASS

```
PSIS Scenario Test Report — PASS
Scenarios: 14/14 passed
Assertions: 96/96 passed
```

### `pnpm run build` — NOT VALIDATED ON WINDOWS

Build failed locally on Windows because the Replit-origin `pnpm-workspace.yaml` excludes Windows-native Rollup/esbuild optional deps (`@rollup/rollup-win32-x64-msvc`). This is expected on the dev laptop; the Linux Docker/CI environment is the intended build target.

### Docker build — DEFERRED

Operator laptop has no Docker installation. `docker build` will be validated in the follow-on GitHub Actions ACI.

### Docker run — DEFERRED

Container runtime validation deferred to GitHub Actions.

### Health endpoint (`GET /api/healthz`) — DEFERRED

Expected response when container runs: `{ "status": "ok" }`

### Frontend load (`GET /`) — DEFERRED

Expected: PSIS home page served from `artifacts/psis/dist/public`.

### SPA route fallback (`GET /track`) — DEFERRED

Expected: `index.html` fallback via Express `/*splat` route in production mode.

---

## Docker Image Design (for CI)

| Stage | Actions |
|-------|---------|
| `deps` | `corepack enable`, `pnpm install --frozen-lockfile` |
| `build` | `pnpm run test:psis` (fails build on test failure), `pnpm run build` |
| `production` | Copies API dist, JSON data dir, frontend dist; exposes `8080`; CMD runs bundled API |

**Runtime env defaults:** `PORT=8080`, `NODE_ENV=production`, `BASE_PATH=/`, `LOG_LEVEL=info`

**Static serving:** Express serves `artifacts/psis/dist/public` when `NODE_ENV=production`; `/api/*` routes unchanged.

---

## Issues Encountered

1. **No local Docker** — Operator confirmed Docker is not installed; all container build/run validation moves to GitHub Actions.
2. **Windows `pnpm install`** — Root `preinstall` script requires `sh` (Replit/Linux-oriented); use `--ignore-scripts` on Windows or build only in CI/Linux.
3. **Windows `pnpm run build`** — Fails on `mockup-sandbox` due to excluded Windows Rollup binaries in workspace overrides; not a blocker for Linux Docker/CI builds.

---

## Acceptance Criteria Checklist

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Dockerfile exists | PASS |
| 2 | .dockerignore exists | PASS |
| 3 | .env.example exists | PASS |
| 4 | `pnpm run test:psis` passes | PASS |
| 5 | `pnpm run build` passes | DEFERRED (CI/Linux) |
| 6 | `docker build` succeeds | DEFERRED (GitHub Actions) |
| 7 | `docker run` succeeds | DEFERRED (GitHub Actions) |
| 8 | `/api/healthz` returns ok | DEFERRED (GitHub Actions) |
| 9 | Frontend loads from container | DEFERRED (GitHub Actions) |
| 10 | `/track` SPA fallback works | DEFERRED (GitHub Actions) |
| 11 | Report artifact created | PASS |

---

## Recommended Next ACI

**ACI-002 — PSIS GitHub Actions Docker CI**

1. Add `.github/workflows/docker-publish.yml`
2. Trigger on push to `main`
3. Steps: checkout → Node 24 + pnpm → `pnpm run test:psis` → `pnpm run build` → `docker build` → smoke test container (`/api/healthz`, `/`, `/track`)
4. Push to Docker Hub: `taig2k/pitching_sequence_intellegence_system_psis` with tags `latest` and `${{ github.sha }}`
5. Store `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` as GitHub secrets

---

## Final Status

**PARTIAL PASS**

Scaffold artifacts and Express production static serving are in place. Scenario tests pass. Docker build/run and end-to-end container validation remain for ACI-002 (GitHub Actions).

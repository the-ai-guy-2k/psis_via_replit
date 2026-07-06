# Getting Started

Day-1 onboarding for mid-level developers on PSIS.

---

## Repository Clone

```bash
git clone https://github.com/the-ai-guy-2k/psis_via_replit.git
cd psis_via_replit
```

**Windows path example:**

```
C:\Users\tim\Documents\business_related\The_AI_Guy\nebula\2 - TAIG2K_SOFTWARE\PSIS
```

---

## Required Tools

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 24 | Match CI and Docker |
| pnpm | 10.34.4 | Enforced via `packageManager` in `package.json` |
| Git | Latest | |
| Code editor | VS Code / Cursor | Recommended |
| **WSL2 (Windows only)** | Recommended | Native Windows build often fails — see below |

---

## Installing Dependencies

**Linux / macOS / WSL (recommended):**

```bash
corepack enable
pnpm install --frozen-lockfile
```

**Windows (PowerShell) — workaround:**

```powershell
npx --yes pnpm@10 install --ignore-scripts
```

The root `preinstall` script requires `sh`, which is not available in cmd.exe. Use WSL for a normal install.

---

## Development Environment

### Important: Windows limitation

`pnpm run build` **often fails on native Windows** because `pnpm-workspace.yaml` excludes Windows Rollup binaries (Replit legacy). **Use WSL2 or rely on CI** to validate builds.

You can still run scenario tests on Windows:

```powershell
$env:PORT='8080'
$env:BASE_PATH='/'
$env:NODE_ENV='production'
npx --yes pnpm@10 run test:psis
```

### Environment variables (always set for build/test)

```bash
export PORT=8080
export BASE_PATH=/
export NODE_ENV=production   # or development for local API experiments
```

---

## Running Tests (Start Here)

```bash
pnpm run test:psis
```

**Expected output:**

```
PSIS Scenario Test Report — PASS
Scenarios: 14/14 passed
Assertions: 96/96 passed
```

This is your fastest feedback loop. Run it before and after any game-logic change.

---

## Running a Full Build

```bash
pnpm run build
```

Runs typecheck across all packages, then builds artifacts. Requires Linux/WSL/CI on Windows.

---

## Running the Application Locally

### Option A — Production-like (after build)

```bash
pnpm run build
PORT=8080 NODE_ENV=production node --enable-source-maps artifacts/api-server/dist/index.mjs
```

Open http://localhost:8080

### Option B — Replit (if using Replit workspace)

Separate artifacts run via platform — see `replit.md`. Not covered here.

### Option C — Trust CI

Merge to `main` and verify GitHub Actions + Docker Hub. Common for Windows-only dev machines.

---

## Project Structure Overview

```
psis_via_replit/
├── artifacts/
│   ├── psis/              ← React frontend (Tracker, Dashboard)
│   └── api-server/        ← Express API + JSON data files
├── lib/
│   ├── api-spec/          ← openapi.yaml (API contract)
│   ├── api-zod/           ← Generated Zod schemas
│   ├── api-client-react/  ← Generated React Query hooks
│   └── psis-game-logic/   ← ★ Game rules (pure TypeScript)
├── scripts/
│   └── src/test-psis-scenarios.ts  ← Scenario tests
├── docs/
│   ├── developer-mid/     ← You are here
│   ├── developer/         ← Senior / architecture docs
│   ├── operator/          ← IT deployment
│   └── manager/           ← Business ops
├── .github/workflows/     ← CI/CD
└── Dockerfile             ← Production image
```

---

## Common First-Day Tasks

| Task | Command / Location |
|------|-------------------|
| Find the Tracker page | `artifacts/psis/src/pages/track.tsx` |
| Find entry creation API | `artifacts/api-server/src/routes/entries.ts` |
| Find game rules | `lib/psis-game-logic/src/index.ts` |
| Run tests | `pnpm run test:psis` |
| Read API contract | `lib/api-spec/openapi.yaml` |
| Check CI status | GitHub → Actions → PSIS PA Validation |

---

## First PR Checklist

- [ ] Branch from latest `main`
- [ ] `pnpm run test:psis` passes (if you touched game logic or entries)
- [ ] `pnpm run typecheck` or full build passes (WSL/CI)
- [ ] If API changed: ran `pnpm --filter @workspace/api-spec run codegen`
- [ ] No duplicated game rules outside `psis-game-logic`
- [ ] PR description explains what and why

---

## Next Steps

1. [Repository_Cheat_Sheet.md](./Repository_Cheat_Sheet.md) — memorize key paths
2. [Development_Workflow.md](./Development_Workflow.md) — how work ships
3. [Common_Tasks.md](./Common_Tasks.md) — your first feature

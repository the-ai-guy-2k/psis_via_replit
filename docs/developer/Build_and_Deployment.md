# Build and Deployment

How PSIS is built, containerized, and released.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 24 |
| pnpm | 10.34.4 (via `packageManager` field) |
| Docker | For local image build (optional; CI is authoritative) |
| OS for dev | **Linux/macOS/WSL recommended** — Windows native build fails due to Replit platform overrides in `pnpm-workspace.yaml` |

---

## pnpm Workspace

```bash
pnpm install --frozen-lockfile
```

**CI note:** `pnpm config set minimum-release-age 0` required in GitHub Actions because workspace enforces 1440-minute release age guard.

**Windows note:** Root `preinstall` uses `sh` — use WSL or `--ignore-scripts` for local Windows installs.

---

## Build Commands

| Command | Action |
|---------|--------|
| `pnpm run typecheck` | TypeScript check all libs + artifacts |
| `pnpm run build` | typecheck + recursive build all packages |
| `pnpm run test:psis` | Scenario tests (gate for merge/release) |
| `pnpm --filter @workspace/api-server run build` | esbuild API bundle only |
| `pnpm --filter @workspace/psis run build` | Vite frontend only |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate Zod + React hooks |

### Required build-time environment

```bash
export PORT=8080
export BASE_PATH=/
export NODE_ENV=production
```

Vite config throws if `PORT` or `BASE_PATH` are missing.

---

## Local Development (Replit-origin)

Original dev uses separate Replit artifacts:

- `artifacts/psis` — Vite dev server
- `artifacts/api-server` — Express on 8080

For Docker-aligned local test:

```bash
pnpm run build
PORT=8080 NODE_ENV=production node --enable-source-maps artifacts/api-server/dist/index.mjs
# Open http://localhost:8080
```

---

## Docker Build

```bash
docker build -t taig2k/pitching_sequence_intellegence_system_psis:local .
```

### Dockerfile stages

| Stage | Action |
|-------|--------|
| `deps` | `pnpm install --frozen-lockfile` |
| `build` | `pnpm run test:psis` then `pnpm run build` |
| `production` | Copy API dist, data seed, frontend dist; CMD node |

**Tests run inside Docker build** — image build fails if scenarios fail.

---

## GitHub Actions

Workflow: `.github/workflows/psis-pa-validation.yml`

Triggers: `push` to `main`, `workflow_dispatch`

See [CI_CD_Pipeline.md](./CI_CD_Pipeline.md) for full stage documentation.

---

## Docker Hub Publication

| Tag | When |
|-----|------|
| `latest` | Every successful `main` push |
| `${{ github.sha }}` | Immutable commit reference |

Repository: `taig2k/pitching_sequence_intellegence_system_psis`

After publish, CI pulls `latest` from Hub and re-runs smoke tests on the published image.

---

## Release Process

```
1. Merge to main
2. GitHub Actions runs full pipeline automatically
3. On success: image published to Docker Hub
4. PA validation report uploaded as artifact (PSIS_PA_Validation)
5. Operators pull latest per docs/operator/
```

No manual Docker push required for standard releases.

---

## Future AWS Deployment

Not implemented. Recommended approach:

1. Pull same Docker Hub image (no forked build)
2. ECS Fargate service or App Runner
3. Target group health check: `/api/healthz`
4. EFS mount: `/app/artifacts/api-server/data`
5. ALB + ACM for TLS termination
6. Secrets via AWS Secrets Manager (if auth added later)

Infrastructure should live in a separate ACI / IaC repo per Nebula governance.

---

## Environment Reference

```env
PORT=8080
NODE_ENV=production
LOG_LEVEL=info
BASE_PATH=/
```

See `.env.example`.

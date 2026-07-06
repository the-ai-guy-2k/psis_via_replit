# Repository Cheat Sheet

One-page navigation reference for PSIS.

---

## Where Is…?

| What | Where |
|------|-------|
| **Frontend** | `artifacts/psis/` |
| **Backend API** | `artifacts/api-server/` |
| **Game logic** | `lib/psis-game-logic/src/index.ts` |
| **API contract** | `lib/api-spec/openapi.yaml` |
| **Zod schemas** | `lib/api-zod/src/generated/` |
| **React API hooks** | `lib/api-client-react/src/generated/` |
| **Scenario tests** | `scripts/src/test-psis-scenarios.ts` |
| **Test reports** | `artifacts/psis/public/reports/` |
| **JSON data** | `artifacts/api-server/data/*.json` |
| **CI workflow** | `.github/workflows/psis-pa-validation.yml` |
| **Dockerfile** | `Dockerfile` |
| **Architecture history** | `replit.md` |

---

## Key Pages (Frontend)

| Page | File |
|------|------|
| Home | `artifacts/psis/src/pages/home.tsx` |
| Tracker | `artifacts/psis/src/pages/track.tsx` |
| Dashboard | `artifacts/psis/src/pages/dashboard.tsx` |
| Outcome wizard | `artifacts/psis/src/lib/outcome.ts` |

---

## Key Routes (Backend)

| Endpoint | File |
|----------|------|
| `GET /api/healthz` | `routes/health.ts` |
| `GET/POST /api/entries` | `routes/entries.ts` |
| `GET /api/dashboard` | `routes/dashboard.ts` |
| `GET /api/innings/current` | `routes/innings.ts` |
| `POST /api/games/new` | `routes/games.ts` |
| `GET /api/sessions` | `routes/sessions.ts` |
| `POST /api/sessions/end` | `routes/sessions.ts` |

---

## Useful Commands

```bash
# Install
pnpm install --frozen-lockfile

# Test (run often)
pnpm run test:psis

# Typecheck
pnpm run typecheck

# Full build (Linux/WSL)
export PORT=8080 BASE_PATH=/ NODE_ENV=production
pnpm run build

# Regenerate API client + Zod
pnpm --filter @workspace/api-spec run codegen

# Run API locally (after build)
PORT=8080 NODE_ENV=production node --enable-source-maps artifacts/api-server/dist/index.mjs

# Health check
curl http://localhost:8080/api/healthz
```

---

## Useful Files

| File | Why |
|------|-----|
| `package.json` | Root scripts |
| `pnpm-workspace.yaml` | Workspace packages + catalog |
| `.env.example` | Runtime env reference |
| `artifacts/api-server/build.mjs` | API esbuild config |
| `artifacts/psis/vite.config.ts` | Frontend build config |
| `artifacts/api-server/src/app.ts` | Middleware + static serving |

---

## Documentation Map

| Folder | Audience |
|--------|----------|
| `docs/developer-mid/` | **You** — implementation |
| `docs/developer/` | Senior / architecture |
| `docs/operator/` | IT deployment |
| `docs/manager/` | Business ops |
| `docs/reports/` | ACI validation reports |

---

## Docker Hub

```
taig2k/pitching_sequence_intellegence_system_psis:latest
```

---

## Ports & URLs (local)

| Item | Value |
|------|-------|
| App | http://localhost:8080 |
| Health | http://localhost:8080/api/healthz |
| Tracker | http://localhost:8080/track |
| Dashboard | http://localhost:8080/dashboard |

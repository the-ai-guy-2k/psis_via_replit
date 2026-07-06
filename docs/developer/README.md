# PSIS Developer Documentation

**Pitch Sequence Intelligence System — Technical Reference for Senior Engineers**

---

## Repository Purpose

PSIS is a pnpm monorepo delivering a React/Vite frontend and Express 5 API for baseball pitching coaches. The Production Artifact is published as a single Docker image on Docker Hub. This documentation explains how the system is engineered, built, deployed, and extended.

**Repository:** https://github.com/the-ai-guy-2k/psis_via_replit.git  
**Docker Hub:** `taig2k/pitching_sequence_intellegence_system_psis`  
**PA status:** PASS

---

## Intended Audience

- Senior software engineers
- Technical leads
- DevOps / platform engineers
- Solution architects

**Not for:** operators ([`docs/operator/`](../operator/README.md)) or managers ([`docs/manager/`](../manager/README.md)).

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│  Browser (React + Vite SPA)                             │
│  artifacts/psis                                         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP /api/*
┌────────────────────▼────────────────────────────────────┐
│  Express 5 API Server                                   │
│  artifacts/api-server                                   │
│  ├── routes/          REST handlers                     │
│  ├── lib/psisStore.ts JSON file I/O                     │
│  └── production: static serve artifacts/psis/dist       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Shared Libraries (lib/)                                │
│  ├── psis-game-logic   Pure EABR / inning rules         │
│  ├── api-spec          OpenAPI contract (source of truth)│
│  ├── api-zod           Generated Zod schemas            │
│  └── api-client-react  Generated React Query hooks      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  JSON flat-file persistence                               │
│  artifacts/api-server/data/*.json                         │
└───────────────────────────────────────────────────────────┘
```

---

## Recommended Reading Order

| Order | Document | When |
|-------|----------|------|
| 1 | [Architecture_Overview.md](./Architecture_Overview.md) | First orientation |
| 2 | [Repository_Guide.md](./Repository_Guide.md) | Navigate the codebase |
| 3 | [System_Design.md](./System_Design.md) | Understand layers and flows |
| 4 | [Game_Logic_Overview.md](./Game_Logic_Overview.md) | EABR rules and where they live |
| 5 | [API_Reference.md](./API_Reference.md) | REST contract |
| 6 | [Build_and_Deployment.md](./Build_and_Deployment.md) | Local build and release |
| 7 | [Docker_Architecture.md](./Docker_Architecture.md) | Production container |
| 8 | [CI_CD_Pipeline.md](./CI_CD_Pipeline.md) | GitHub Actions governance |
| 9 | [Extension_Guide.md](./Extension_Guide.md) | Adding features safely |
| 10 | [Technical_Debt.md](./Technical_Debt.md) | Known tradeoffs and risks |

---

## Quick Developer Commands

```bash
# Linux/macOS or WSL (recommended for dev)
pnpm install --frozen-lockfile
export PORT=8080 BASE_PATH=/ NODE_ENV=production
pnpm run test:psis          # Scenario tests (required before merge)
pnpm run build              # Full typecheck + build
pnpm --filter @workspace/api-spec run codegen   # After OpenAPI changes
```

See [Build_and_Deployment.md](./Build_and_Deployment.md) for Docker and CI details.

---

## New Engineer Onboarding (Day 1)

1. Read [Architecture_Overview.md](./Architecture_Overview.md) and [Repository_Guide.md](./Repository_Guide.md)
2. Set up **WSL2 or Linux** (Windows native build is not supported — see [Technical_Debt.md](./Technical_Debt.md))
3. `pnpm install --frozen-lockfile`
4. `export PORT=8080 BASE_PATH=/ NODE_ENV=production`
5. `pnpm run test:psis` — expect PASS (14 scenarios, 96 assertions)
6. `pnpm run build`
7. Skim `replit.md` for historical architecture decisions
8. Review latest `PSIS_PA_Validation` artifact from GitHub Actions

---

## Related Documentation

| Audience | Location |
|----------|----------|
| Operators | [docs/operator/](../operator/README.md) |
| Managers | [docs/manager/](../manager/README.md) |
| Architecture decisions (historical) | `replit.md` (repo root) |
| ACI reports | `docs/reports/` |

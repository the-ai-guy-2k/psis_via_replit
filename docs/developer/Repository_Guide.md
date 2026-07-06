# Repository Guide

Directory layout and package responsibilities.

---

## Top-Level Layout

```
PSIS/
├── artifacts/           Deployable applications
├── lib/                 Shared libraries
├── scripts/             Scenario test runner
├── docs/                Documentation by audience
│   ├── developer/       ← You are here
│   ├── operator/
│   ├── manager/
│   └── reports/         ACI validation reports
├── .github/workflows/   CI/CD
├── Dockerfile           Production container
├── package.json         Workspace root scripts
├── pnpm-workspace.yaml  Workspace + catalog config
├── replit.md            Historical architecture decisions
└── tsconfig.base.json   Shared TS config
```

---

## Artifacts

### `artifacts/psis` — `@workspace/psis`

**Primary frontend.** React + Vite coaching UI.

| Path | Purpose |
|------|---------|
| `src/pages/` | `home`, `track`, `dashboard`, `not-found` |
| `src/components/` | Layout, UI primitives (shadcn-style) |
| `src/lib/outcome.ts` | Wizard definitions, `describeOutcome()` |
| `public/reports/` | Generated scenario test reports (served statically) |
| `vite.config.ts` | Requires `PORT` + `BASE_PATH` at build time |
| `dist/public/` | Production build output |

### `artifacts/api-server` — `@workspace/api-server`

**Primary backend.** Express 5 REST API.

| Path | Purpose |
|------|---------|
| `src/index.ts` | Server bootstrap, PORT validation |
| `src/app.ts` | Middleware, `/api` router, production static serving |
| `src/routes/` | Route handlers per OpenAPI tag |
| `src/lib/psisStore.ts` | JSON persistence + game-logic re-exports |
| `src/lib/logger.ts` | pino configuration |
| `data/` | Runtime JSON data files |
| `build.mjs` | esbuild production bundle |
| `dist/index.mjs` | Production entrypoint |

### `artifacts/mockup-sandbox` — `@workspace/mockup-sandbox`

UI mockup artifact from Replit. Built in CI but **not** included in production Docker image. Safe to ignore for PSIS operations.

---

## Libraries

### `lib/api-spec` — `@workspace/api-spec`

| File | Purpose |
|------|---------|
| `openapi.yaml` | **API contract source of truth** |
| `orval.config.ts` | Codegen configuration |

Run after contract changes:

```bash
pnpm --filter @workspace/api-spec run codegen
```

### `lib/api-zod` — `@workspace/api-zod`

Generated Zod schemas from OpenAPI. Used by API routes for request/response validation.

### `lib/api-client-react` — `@workspace/api-client-react`

Generated React Query hooks. `custom-fetch.ts` provides optional `setBaseUrl()` for non-Replit deployments.

### `lib/psis-game-logic` — `@workspace/psis-game-logic`

Pure domain logic. **All new game rules go here.**

### `lib/db` — `@workspace/db`

Drizzle ORM scaffold. **Not used** by PSIS runtime — retained from workspace template.

---

## Scripts

### `scripts` — `@workspace/scripts`

| File | Purpose |
|------|---------|
| `src/test-psis-scenarios.ts` | 14 scenario tests, 96 assertions |
| Invoked via | `pnpm run test:psis` |

Outputs reports to `artifacts/psis/public/reports/PSIS_Test_Report.{md,json}`.

---

## Package Interaction Map

```
openapi.yaml
    ├─codegen─→ api-zod ─────────→ api-server routes
    └─codegen─→ api-client-react ─→ psis frontend

psis-game-logic ──→ psisStore ──→ routes
                 └─→ test-psis-scenarios.ts
```

---

## Where Future Code Belongs

| Change type | Location |
|-------------|----------|
| New REST endpoint | `openapi.yaml` → codegen → `routes/*.ts` |
| New game rule | `lib/psis-game-logic/src/index.ts` + scenario test |
| New UI page | `artifacts/psis/src/pages/` + wouter route in `App.tsx` |
| New wizard outcome | `artifacts/psis/src/lib/outcome.ts` + server validation in `entries.ts` |
| Persistence change | `psisStore.ts` (avoid unless migrating off JSON) |
| Auth (future) | New middleware in `app.ts` + OpenAPI security schemes |
| AWS infra (future) | New `infra/` or separate repo per Nebula standards |

---

## Files to Avoid Modifying Without Cause

| File | Reason |
|------|--------|
| `pnpm-workspace.yaml` platform overrides | Replit/Linux build targets; breaks Windows dev |
| `openapi.yaml` `info.title` | Breaks Orval import paths |
| `replit.md` | Historical record; update only when decisions change |
| Generated `lib/*/generated/` | Regenerate via codegen |

---

## Documentation by Audience

| Path | Audience |
|------|----------|
| `docs/developer/` | Engineers (this folder) |
| `docs/operator/` | IT technicians |
| `docs/manager/` | Business / ops managers |
| `replit.md` | Deep historical context for developers |

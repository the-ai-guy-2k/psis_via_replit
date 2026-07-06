# Extension Guide

How to add features, maintain quality, and follow Nebula ACI workflow.

---

## Development Workflow

```
1. Branch from main
2. Implement change in correct layer (see Repository_Guide)
3. pnpm run test:psis          # Required for game logic changes
4. pnpm run build              # Linux/WSL/CI
5. If API contract changed:
     pnpm --filter @workspace/api-spec run codegen
6. Open PR → merge to main
7. CI publishes Docker image automatically
```

---

## Adding a Feature — Checklist

### API-only change

- [ ] Update `lib/api-spec/openapi.yaml`
- [ ] Run codegen
- [ ] Implement route in `artifacts/api-server/src/routes/`
- [ ] Add/update Zod validation
- [ ] Update frontend hooks usage if needed

### Game logic change

- [ ] Implement in `lib/psis-game-logic/src/index.ts`
- [ ] Add scenario(s) to `scripts/src/test-psis-scenarios.ts`
- [ ] `pnpm run test:psis` → PASS
- [ ] Update `entries.ts` glue only if needed
- [ ] Do **not** change scenario test truth without explicit approval

### UI change

- [ ] Page/component in `artifacts/psis/src/`
- [ ] Use generated hooks from `@workspace/api-client-react`
- [ ] Use `describeOutcome()` for outcome display
- [ ] Match existing Tailwind + shadcn patterns

### New page/route

- [ ] Create `src/pages/<name>.tsx`
- [ ] Add wouter `<Route>` in `App.tsx`
- [ ] Add navigation link in `layout.tsx`

---

## Coding Standards

| Standard | Detail |
|----------|--------|
| Language | TypeScript 5.9 strict |
| Package manager | pnpm only (enforced by preinstall) |
| Imports | Workspace protocol `workspace:*` |
| Validation | Zod at API boundary |
| Game rules | Pure functions in `psis-game-logic` |
| UI text | `describeOutcome()` for entries |
| Logging | pino — no `console.log` in production paths |
| Formatting | Prettier (repo default) |

---

## Repository Standards

| Rule | Reason |
|------|--------|
| OpenAPI title unchanged | Orval path stability |
| No rules in routes beyond glue | Single source of truth in lib |
| No direct `entry.result` in UI | Legacy compatibility |
| Scenario tests gate releases | CI + Docker build enforce |
| Docs by audience | `developer/`, `operator/`, `manager/` |

---

## Testing Expectations

| Test type | Command | When required |
|-----------|---------|---------------|
| Scenario tests | `pnpm run test:psis` | Any `psis-game-logic` change |
| Typecheck | `pnpm run typecheck` | All changes (part of build) |
| CI smoke tests | Automatic | All merges to main |
| Unit tests | None separate | Scenarios are the integration gate |

Scenario reports output to `artifacts/psis/public/reports/` — commit regenerated reports if tests change.

---

## Documentation Expectations

| Change | Update |
|--------|--------|
| API endpoint | `openapi.yaml`, `API_Reference.md`, codegen |
| Game rule | `Game_Logic_Overview.md`, `replit.md` if architectural |
| Deployment | `Build_and_Deployment.md`, operator docs |
| Operator impact | `docs/operator/` |
| Manager impact | `docs/manager/` |
| New limitation | `Technical_Debt.md` |

---

## ACI Workflow (Nebula)

PSIS development follows Agentic Change Instructions:

| Phase | Example ACIs |
|-------|--------------|
| PA scaffold | Docker, CI, publish |
| Documentation | Operator, manager, developer |
| Future PE | AWS deployment |

Each ACI produces a report in `docs/reports/`. Do not mix unrelated changes across ACIs.

---

## OpenAPI Codegen

After editing `lib/api-spec/openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run codegen
pnpm run typecheck
```

Generates:

- `lib/api-zod/src/generated/`
- `lib/api-client-react/src/generated/`

---

## Anti-Patterns

| Do not | Do instead |
|--------|------------|
| Duplicate outs logic in routes | Import `rawOutsForOutcome` |
| Accept `goodCount` from client | Server-compute in `entries.ts` |
| Merge inning display + assignment | Keep functions separate |
| Build on Windows without WSL | Use WSL, Linux, or CI |
| Push Docker manually | Merge to `main`, let CI publish |
| Add auth without OpenAPI update | Design security scheme first |

---

## Onboarding Checklist (New Engineer)

- [ ] Read [Architecture_Overview.md](./Architecture_Overview.md)
- [ ] Read [Repository_Guide.md](./Repository_Guide.md)
- [ ] Set up WSL or Linux dev environment
- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm run test:psis` — confirm PASS
- [ ] `pnpm run build`
- [ ] Skim `replit.md` for historical decisions
- [ ] Review latest `PSIS_PA_Validation` GitHub Actions artifact

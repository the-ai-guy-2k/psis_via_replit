# Development Workflow

How work moves from idea to production on PSIS.

---

## Typical Development Lifecycle

```
Issue / ACI assignment
        ↓
Understand Current Truth (docs, replit.md, existing code)
        ↓
Review scope (GVCA / ACICE if your org uses them)
        ↓
Implement feature in correct layer
        ↓
Run pnpm run test:psis (+ build if possible)
        ↓
Validate locally or via PR CI
        ↓
Merge to main
        ↓
GitHub Actions → Docker Hub (automatic)
```

---

## Before You Code

1. **Read the assignment** — ACIs define scope and what NOT to change
2. **Find similar code** — grep for existing patterns before inventing new ones
3. **Identify layers touched:**
   - UI only?
   - API + OpenAPI?
   - Game logic?
4. **Check Current Truth** in the ACI or `docs/developer/` for PA status and constraints

---

## Branch Expectations

| Practice | Detail |
|----------|--------|
| Base branch | `main` |
| Branch naming | Descriptive: `feature/session-export`, `fix/inning-display` |
| Scope | One feature or fix per branch when possible |
| Keep updated | Rebase or merge `main` before PR if branch is stale |

---

## Commit Practices

- Write clear commit messages (what + why)
- Do not commit `.env` files or secrets
- Do not commit unrelated formatting changes
- Scenario test reports (`artifacts/psis/public/reports/`) update when tests run — include if your change affects test output
- **Do not commit** unless your team/ACI asks you to

---

## Implementation Order (Recommended)

For a typical feature:

```
1. Game logic (if needed)     → lib/psis-game-logic
2. Scenario tests             → scripts/src/test-psis-scenarios.ts
3. OpenAPI contract           → lib/api-spec/openapi.yaml
4. Codegen                    → pnpm --filter @workspace/api-spec run codegen
5. API route                  → artifacts/api-server/src/routes/
6. Frontend                   → artifacts/psis/src/
7. Full test + build
```

Game logic **before** API/UI prevents rework.

---

## Quality Gates Before Merge

| Gate | Command / Check |
|------|-----------------|
| Scenario tests | `pnpm run test:psis` |
| Typecheck | `pnpm run typecheck` |
| Full build | `pnpm run build` (WSL/CI) |
| CI green | GitHub Actions on PR/push |

**CI always runs:** install → test:psis → build → docker build → smoke tests → publish to Docker Hub.

A failing scenario test **blocks the Docker image**.

---

## GitHub Actions Interaction

| Event | What happens |
|-------|--------------|
| Push to `main` | Full pipeline runs automatically |
| `workflow_dispatch` | Manual trigger from Actions tab |
| PR (if configured) | Depends on repo settings — verify in GitHub |

**You do not push Docker images manually.** Merge to `main` and CI publishes `latest`.

Workflow file: `.github/workflows/psis-pa-validation.yml`

Monitor: https://github.com/the-ai-guy-2k/psis_via_replit/actions

---

## Documentation Updates

| Your change affects… | Update |
|---------------------|--------|
| Operators (deploy/run) | `docs/operator/` |
| Managers (process) | `docs/manager/` |
| API / architecture | `docs/developer/` |
| How to implement | `docs/developer-mid/` (this folder) |

Documentation-only ACIs should not change application code.

---

## ACI Workflow (Nebula)

Work is often delivered as **Agentic Change Instructions (ACIs)**:

- Each ACI has acceptance criteria and a report
- Stay within scope ("Do not build" sections are real)
- PA phase is complete — new work may target AWS PE, features, or docs

---

## Definition of Done

- [ ] Acceptance criteria met
- [ ] `pnpm run test:psis` PASS (if applicable)
- [ ] Build passes (locally in WSL or in CI)
- [ ] No game rules duplicated outside `psis-game-logic`
- [ ] OpenAPI/codegen updated if contract changed
- [ ] Docs updated if behavior visible to operators/managers/devs

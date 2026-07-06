# Developer FAQ

Quick answers for mid-level developers on PSIS.

---

## Where should I add new code?

| Type | Location |
|------|----------|
| Game rules | `lib/psis-game-logic` |
| REST endpoint | `openapi.yaml` → codegen → `routes/` |
| React UI | `artifacts/psis/src/` |
| JSON file I/O | `psisStore.ts` |
| Tests | `scripts/src/test-psis-scenarios.ts` |

See [Implementing_Features.md](./Implementing_Features.md).

---

## How do I know if I broke EABR?

```bash
pnpm run test:psis
```

If any scenario fails, you broke a rule or need to add a new scenario for intentional behavior change.

---

## Why are there multiple documentation folders?

| Folder | Who reads it |
|--------|--------------|
| `docs/developer-mid/` | **You** — how to implement |
| `docs/developer/` | Senior devs — architecture |
| `docs/operator/` | IT — Docker deploy |
| `docs/manager/` | Managers — ops oversight |
| `docs/reports/` | ACI validation artifacts |

Same product, different audiences.

---

## How do I test before committing?

**Minimum (game logic):**

```bash
pnpm run test:psis
```

**Recommended:**

```bash
pnpm run test:psis
pnpm run typecheck
pnpm run build    # WSL or wait for CI
```

---

## How do I interpret CI failures?

| Step failed | Likely fix |
|-------------|------------|
| Install dependencies | Lockfile out of sync — `pnpm install` locally |
| Run scenario tests | Fix `psis-game-logic` or tests |
| Build application | TypeScript errors — run typecheck |
| Docker build | Same as build; Dockerfile runs tests too |
| Smoke test | Server/static routing — check health URL |
| Publish | Docker Hub secrets (DevOps) |

Full guide: [Debugging_Guide.md](./Debugging_Guide.md)

---

## Do I need Docker on my laptop?

**No.** Nebula governance runs Docker in GitHub Actions. Use WSL for builds if possible; otherwise rely on CI.

---

## Do I need to run codegen?

**Yes**, whenever you edit `lib/api-spec/openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Can I use npm or yarn?

**No.** `preinstall` enforces pnpm only.

---

## Why does build fail on Windows?

`pnpm-workspace.yaml` excludes Windows native binaries (Replit legacy). Use **WSL2** or CI.

---

## Where is the source of truth for API types?

`lib/api-spec/openapi.yaml` → codegen → `@workspace/api-zod` and `@workspace/api-client-react`.

---

## Can I accept goodCount/badCount from the frontend?

**No.** Server computes all EABR fields in `entries.ts` using `psis-game-logic`.

---

## What branch do I merge to?

`main` — triggers CI and Docker Hub publish.

---

## Who updates scenario test expected values?

Only with explicit approval. Tests define EABR truth.

---

## Where do I ask about baseball rules?

1. [Working_With_EABR.md](./Working_With_EABR.md)
2. `replit.md` (detailed decisions)
3. Tech lead / product owner

---

## What's the fastest way to get oriented?

1. [Getting_Started.md](./Getting_Started.md)
2. [Repository_Cheat_Sheet.md](./Repository_Cheat_Sheet.md)
3. Run `pnpm run test:psis`
4. Open `track.tsx` and `entries.ts` side by side

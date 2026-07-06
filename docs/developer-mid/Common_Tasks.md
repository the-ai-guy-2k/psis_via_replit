# Common Tasks

Step-by-step recipes for everyday PSIS development work.

---

## Add an API Endpoint

### 1. Update OpenAPI

Edit `lib/api-spec/openapi.yaml`:

```yaml
paths:
  /my-resource:
    get:
      operationId: getMyResource
      tags: [my-tag]
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MyResource"
```

### 2. Run codegen

```bash
pnpm --filter @workspace/api-spec run codegen
pnpm run typecheck
```

### 3. Create route handler

`artifacts/api-server/src/routes/my-resource.ts`:

```typescript
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  res.json({ /* ... */ });
});

export default router;
```

### 4. Register router

`artifacts/api-server/src/routes/index.ts`:

```typescript
import myResourceRouter from "./my-resource";
// ...
router.use("/my-resource", myResourceRouter);
```

### 5. Validate

```bash
pnpm run typecheck
pnpm run build   # WSL/CI
curl http://localhost:8080/api/my-resource
```

**Checklist before PR:**

- [ ] OpenAPI updated
- [ ] Codegen run
- [ ] Route registered in `index.ts`
- [ ] typecheck passes
- [ ] Manual curl or hook test

### 6. Frontend (optional)

Use generated hook from `@workspace/api-client-react` in React component.

---

## Add a React Page

### 1. Create page component

`artifacts/psis/src/pages/my-page.tsx`

### 2. Add route

`artifacts/psis/src/App.tsx`:

```tsx
import MyPage from "@/pages/my-page";
// inside Switch:
<Route path="/my-page" component={MyPage} />
```

### 3. Add navigation (if needed)

`artifacts/psis/src/components/layout.tsx` — add link.

### 4. Validate

```bash
pnpm run typecheck
# Build + open http://localhost:8080/my-page
```

---

## Update Game Logic

### 1. Read existing scenarios

`scripts/src/test-psis-scenarios.ts` — find related tests.

### 2. Implement change

`lib/psis-game-logic/src/index.ts`

### 3. Add/update scenario test

Same file — new assertions with clear names.

### 4. Run tests

```bash
pnpm run test:psis
```

Must show **PASS** for all scenarios.

### 5. Update API glue if needed

`artifacts/api-server/src/routes/entries.ts` — only wiring, not duplicate math.

### 6. Regenerate reports

Tests auto-write `artifacts/psis/public/reports/PSIS_Test_Report.md`.

---

## Run Tests

```bash
export PORT=8080 BASE_PATH=/ NODE_ENV=production
pnpm run test:psis
```

**Windows:**

```powershell
$env:PORT='8080'; $env:BASE_PATH='/'; $env:NODE_ENV='production'
npx --yes pnpm@10 run test:psis
```

---

## Review GitHub Actions

1. Open https://github.com/the-ai-guy-2k/psis_via_replit/actions
2. Click latest **PSIS PA Validation** run
3. Check failed step (red X)
4. Expand logs for that step
5. See [Debugging_Guide.md](./Debugging_Guide.md) for step-specific fixes

---

## Publish Documentation

Documentation changes do not trigger different CI — same pipeline runs on `main`.

```bash
git add docs/
git commit -m "Update PSIS documentation for <topic>."
git push origin main
```

Verify CI still passes (docs-only changes should not break build).

---

## Run Codegen After API Change

```bash
pnpm --filter @workspace/api-spec run codegen
pnpm run typecheck
```

Fix any TypeScript errors in routes and frontend.

---

## Local API Smoke Test

```bash
pnpm run build
PORT=8080 NODE_ENV=production node --enable-source-maps artifacts/api-server/dist/index.mjs
```

Another terminal:

```bash
curl http://localhost:8080/api/healthz
curl http://localhost:8080/api/entries
```

---

## Update Operator/Manager Docs

If your feature changes deployment or business process:

| Audience | Folder |
|----------|--------|
| IT staff | `docs/operator/` |
| Managers | `docs/manager/` |

Do not duplicate — link to operator steps from developer docs.

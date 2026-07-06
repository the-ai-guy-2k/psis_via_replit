# Debugging Guide

How to diagnose common PSIS development problems.

---

## First Steps (Any Issue)

1. **What failed?** — tests, build, CI, runtime, browser
2. **What changed?** — files, layers (UI/API/logic)
3. **Reproduce minimally** — one scenario, one endpoint, one page

---

## Reading Logs

### API server (local)

```bash
PORT=8080 NODE_ENV=development node --enable-source-maps artifacts/api-server/dist/index.mjs
```

Logs via **pino**:

- Production: JSON to stdout
- Development: colorized via pino-pretty

Set verbosity:

```bash
LOG_LEVEL=debug PORT=8080 NODE_ENV=production node ...
```

### HTTP request logs

pino-http logs method, url (no query string), status code per request.

### Docker container

```bash
docker logs psis
docker logs -f psis   # follow
```

---

## Health Endpoint

```bash
curl http://localhost:8080/api/healthz
```

**Healthy:** `{"status":"ok"}`

| Symptom | Likely cause |
|---------|--------------|
| Connection refused | Server not running or wrong port |
| Timeout | Container starting slowly or crashed |
| Non-JSON response | Wrong URL or static file served |

---

## Common Errors

### `PORT environment variable is required`

Set `PORT=8080` before starting API or building frontend.

### `BASE_PATH environment variable is required`

Set `BASE_PATH=/` before Vite build.

### `Use pnpm instead`

You ran `npm install`. Use `pnpm install`.

### `Cannot find module @rollup/rollup-win32-x64-msvc`

Windows native build. **Use WSL** or validate in CI.

### `preinstall` / `sh` not found (Windows)

```powershell
npx pnpm@10 install --ignore-scripts
```

Or use WSL.

### Zod validation error on API

Check request body against `CreateEntryInput` in OpenAPI. Missing `outcomeDetail` for `ground_out` / `hit` is a common mistake.

### Scenario test FAIL

Read failing assertion name in output. Open matching section in `test-psis-scenarios.ts`. Fix logic in `psis-game-logic`, not the test expectation.

---

## Docker Troubleshooting

| Problem | Fix |
|---------|-----|
| Daemon not running | Start Docker Desktop |
| Port in use | `-p 9080:8080` |
| Container exits | `docker logs <container>` — usually missing `PORT` |
| Frontend 404 on `/` | Ensure `NODE_ENV=production` and frontend dist exists in image |
| Data missing after restart | Volume not mounted — see operator docs |

**Local Docker is optional** — CI is authoritative per Nebula governance.

---

## GitHub Actions Troubleshooting

Workflow: `.github/workflows/psis-pa-validation.yml`

| Failed step | Common cause |
|-------------|--------------|
| Install dependencies | Lockfile drift; `minimumReleaseAge` (fixed in workflow) |
| Run scenario tests | Logic regression — fix code |
| Build application | TypeScript error; Linux-only dep issue |
| Docker build | Same as build + Dockerfile test stage |
| Smoke test | Health/frontend routing — check `app.ts` static serving |
| Publish | Docker Hub credentials |
| Pull published image | Hub propagation delay (rare) |

**View logs:** GitHub → Actions → failed run → failed step

**API check without gh CLI:**

```
https://api.github.com/repos/the-ai-guy-2k/psis_via_replit/actions/workflows/psis-pa-validation.yml/runs?per_page=1
```

---

## Typical Build Failures

| Error area | Fix |
|------------|-----|
| TypeScript in generated code | Run codegen after OpenAPI change |
| `artifacts/mockup-sandbox` | Built as part of workspace — fails on Windows |
| esbuild API bundle | Check `build.mjs` external list |
| Vite build | Verify `PORT` and `BASE_PATH` env vars set |

---

## How to Isolate Issues

### Game logic only

```bash
pnpm run test:psis
```

No server needed.

### API only

```bash
pnpm run build
PORT=8080 NODE_ENV=production node artifacts/api-server/dist/index.mjs
curl http://localhost:8080/api/entries
```

### Frontend only

Check browser DevTools → Network tab for `/api/*` failures.

### Contract mismatch

Compare `openapi.yaml` with route handler and generated hook types.

---

## When to Escalate

| Situation | Escalate to |
|-----------|-------------|
| Scenario truth dispute | Tech lead + product |
| CI infra / secrets | DevOps |
| Architectural change | Senior dev + `replit.md` update |
| Data corruption in production | IT operator + senior dev |

---

## Useful Commands

```bash
pnpm run test:psis
pnpm run typecheck
pnpm run build
pnpm --filter @workspace/api-spec run codegen
docker ps -a
docker logs psis
```

See [Repository_Cheat_Sheet.md](./Repository_Cheat_Sheet.md).

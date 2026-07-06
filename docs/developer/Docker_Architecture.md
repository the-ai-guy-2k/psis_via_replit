# Docker Architecture

Production container design for PSIS.

---

## Image

```
taig2k/pitching_sequence_intellegence_system_psis:latest
taig2k/pitching_sequence_intellegence_system_psis:<commit-sha>
```

Base: `node:24-bookworm-slim`

---

## Multi-Stage Build

| Stage | Contents | Purpose |
|-------|----------|---------|
| `base` | Node 24 + corepack | Foundation |
| `deps` | Full workspace copy, `pnpm install` | Dependencies |
| `build` | `test:psis` + `pnpm run build` | Compile + validate |
| `production` | Runtime artifacts only | Minimal attack surface |

### Production stage copies

```
artifacts/api-server/dist/     # Bundled Express app
artifacts/api-server/data/     # Seed JSON files
artifacts/psis/dist/           # Vite static build
```

No `node_modules` in final image — API is esbuild-bundled.

---

## Process Model

```
CMD: node --enable-source-maps artifacts/api-server/dist/index.mjs
WORKDIR: /app
EXPOSE: 8080
```

Single Node process handles API and static files.

---

## Environment Variables

| Variable | Default in image | Required | Purpose |
|----------|------------------|----------|---------|
| `PORT` | `8080` | Yes | HTTP listen port |
| `NODE_ENV` | `production` | Yes | Enables static serving |
| `BASE_PATH` | `/` | No | URL base for static assets |
| `LOG_LEVEL` | `info` | No | pino verbosity |

Example run:

```bash
docker run -d --name psis \
  -p 8080:8080 \
  -e PORT=8080 \
  -e NODE_ENV=production \
  taig2k/pitching_sequence_intellegence_system_psis:latest
```

---

## Static Frontend Serving

When `NODE_ENV=production`, `app.ts`:

1. Mounts `express.static` on `artifacts/psis/dist/public`
2. SPA fallback via Express 5 `/*splat` route for non-`/api` paths
3. Root `/` served via `index: "index.html"` on static middleware

API routes mounted at `/api` **before** static middleware.

---

## Health Endpoint

```
GET /api/healthz → {"status":"ok"}
```

Use for:

- GitHub Actions smoke tests
- Docker healthcheck (recommended for orchestrators)
- Load balancer target group checks

Recommended orchestrator healthcheck:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/healthz || exit 1
```

*(Not yet in Dockerfile — future improvement)*

---

## Volume Mount — Persistence

```bash
-v /host/psis-data:/app/artifacts/api-server/data
```

| File in volume | Data |
|----------------|------|
| `psis_entries.json` | All plate appearances |
| `psis_game_state.json` | Current gameId |
| `psis_sessions.json` | Saved sessions |

Without volume: data is ephemeral inside container layer.

---

## Networking

| Port | Mapping |
|------|---------|
| Container | 8080 |
| Host | Operator choice (`-p 8080:8080`) |

No HTTPS inside container. Terminate TLS at reverse proxy or load balancer.

---

## .dockerignore

Excludes: `.git`, `node_modules`, `.agents`, `attached_assets`, `.env*`, logs

Includes everything needed for `pnpm install` and build.

---

## Future Production Improvements

| Improvement | Priority |
|-------------|----------|
| `HEALTHCHECK` in Dockerfile | High |
| Non-root USER in container | High |
| Read-only root filesystem + volume | Medium |
| Distroless or hardened base image | Medium |
| Multi-arch build (arm64) | Low |
| Separate API/frontend containers | Low (adds complexity) |

See [Technical_Debt.md](./Technical_Debt.md).

---

## Security Notes

- No authentication in current release
- CORS enabled for all origins (`cors()` default)
- Bind to host network carefully in production
- Keep image updated via CI `latest` tag

# Technical Debt

Known limitations, tradeoffs, and future work.

---

## Known Limitations

| Item | Impact | Mitigation |
|------|--------|------------|
| No authentication | Anyone with URL can access | Network isolation, VPN, future auth ACI |
| JSON flat-file storage | No concurrent writes, full-file reads | Volume mount + backup; migrate if scale demands |
| Single-process container | API + static in one process | Acceptable for current scale |
| No HTTPS in container | Cleartext HTTP | Reverse proxy / ALB + ACM |
| No pagination on `/entries` | Memory grows with season data | Add cursor pagination if needed |
| `lib/db` unused | Dead scaffold | Remove or use in migration ACI |
| Replit dev vs Docker prod | Different serving models | Test Docker path in CI |

---

## Architectural Tradeoffs

### JSON files vs database

**Chosen:** JSON files (original spec intent, simplicity)

**Tradeoff:** No query engine, no transactions, single-writer assumption

**When to revisit:** Multi-team concurrent access, >10k entries, reporting queries

### Pure logic lib vs inline routes

**Chosen:** `@workspace/psis-game-logic` shared with tests

**Tradeoff:** Extra package boundary, codegen for types

**Benefit:** Scenario tests validate exact production rules

### esbuild bundle vs node_modules in Docker

**Chosen:** Bundled API in production image

**Tradeoff:** pino worker bundling complexity

**Benefit:** Smaller image, faster cold start

### OpenAPI codegen vs hand-written clients

**Chosen:** Orval from `openapi.yaml`

**Tradeoff:** Codegen step required on contract changes

**Benefit:** Frontend/backend contract alignment

---

## Scalability Concerns

| Concern | Threshold | Risk |
|---------|-----------|------|
| Entry file size | Large seasons | Slow read/write |
| In-memory aggregation | Dashboard GET | CPU/memory on large datasets |
| Single container | Many concurrent users | Node event loop saturation |
| No CDN | Static assets from Express | Higher latency at distance |

---

## Future Migration Ideas

| Migration | Description | Effort |
|-----------|-------------|--------|
| PostgreSQL + Drizzle | Use existing `lib/db` scaffold | High |
| Auth (JWT/session) | OpenAPI security + middleware | Medium |
| AWS ECS Fargate | PE deployment ACI | Medium |
| EFS persistence | Mount for JSON or DB | Low-Medium |
| Split API/frontend containers | Separate deploy units | Medium |
| Redis session cache | If auth added | Medium |
| Remove Replit overrides | Clean `pnpm-workspace.yaml` for Windows dev | Low |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss without volume | Medium | High | Operator docs, volume mount |
| Unauthorized access | Medium | Medium | Network controls |
| Supply chain (npm) | Low | High | `minimumReleaseAge`, CI frozen lockfile |
| Game logic regression | Medium | High | Scenario test gate in CI + Docker |
| Windows dev environment broken | High | Low | WSL documented, CI is authoritative |
| Docker Hub outage | Low | Medium | Cache images in registry mirror |

---

## Replit Legacy Debt

| Item | Notes |
|------|-------|
| `pnpm-workspace.yaml` platform exclusions | Linux-only optional deps |
| `preinstall` sh script | Fails on Windows cmd |
| `.replit` artifact configs | Dev-only, not used in Docker |
| `mockup-sandbox` artifact | Built in CI, not in production image |
| `@replit/vite-plugin-*` | Dev-only Vite plugins |

---

## Documentation Debt

| Item | Status |
|------|--------|
| Operator docs | Complete (ACI-004) |
| Manager docs | Complete (ACI-005) |
| Developer docs | Complete (ACI-006) |
| AWS PE runbook | Not started |
| OpenAPI served at runtime | Not implemented |

---

## Recommended Priority Order

1. AWS PE deployment + persistent storage
2. Dockerfile `HEALTHCHECK` + non-root user
3. Authentication if exposed beyond trusted network
4. Database migration if data volume grows
5. Windows-native dev environment cleanup

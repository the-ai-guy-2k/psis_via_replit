# Technology Rationale

Why each major technology was chosen for PSIS.

---

## React

| Aspect | Rationale |
|--------|-----------|
| **Why** | Replit workspace standard; rich ecosystem for forms and wizards |
| **Use in PSIS** | Tracker wizard, Dashboard, scoreboard |
| **Alternatives** | Vue, Svelte, server-rendered templates |
| **Tradeoff** | Bundle size vs component model — accepted for coaching UX complexity |

---

## Vite

| Aspect | Rationale |
|--------|-----------|
| **Why** | Fast dev/build; first-class TypeScript; Replit artifact integration |
| **Use in PSIS** | Frontend build → `dist/public` |
| **Alternatives** | Webpack, Create React App |
| **Tradeoff** | Requires `PORT`/`BASE_PATH` at config load — explicit env contract |

---

## Express 5

| Aspect | Rationale |
|--------|-----------|
| **Why** | Supported in Replit Node artifact; simple REST; static middleware for PA |
| **Use in PSIS** | REST API, production static hosting |
| **Alternatives** | Fastify, Hono, Flask (original spec) |
| **Tradeoff** | Single-threaded Node — adequate for scope |

---

## TypeScript

| Aspect | Rationale |
|--------|-----------|
| **Why** | Workspace-wide type safety; shared types via codegen |
| **Use in PSIS** | All application and domain code |
| **Alternatives** | JavaScript only |
| **Tradeoff** | Build step complexity |

---

## pnpm Workspaces

| Aspect | Rationale |
|--------|-----------|
| **Why** | Replit monorepo standard; efficient installs; workspace protocol |
| **Use in PSIS** | `artifacts/*`, `lib/*`, `scripts` |
| **Alternatives** | npm workspaces, yarn, single package |
| **Tradeoff** | `preinstall` sh guard; platform overrides for Replit Linux |

---

## Zod + Orval

| Aspect | Rationale |
|--------|-----------|
| **Why** | Runtime validation + OpenAPI-driven codegen |
| **Use in PSIS** | API input/output validation; React hooks |
| **Alternatives** | Joi, hand-written validators |
| **Tradeoff** | Generated code must not be hand-edited |

---

## pino

| Aspect | Rationale |
|--------|-----------|
| **Why** | Structured JSON logging for containers |
| **Use in PSIS** | HTTP + app logs |
| **Alternatives** | winston, console.log |
| **Tradeoff** | esbuild bundling for workers |

---

## JSON Files

| Aspect | Rationale |
|--------|-----------|
| **Why** | Simplicity; original spec; single-writer assumption |
| **See** | ADR-001 |

---

## Docker

| Aspect | Rationale |
|--------|-----------|
| **Why** | Portable Production Artifact; operator familiarity |
| **Use in PSIS** | Single image: API + static UI |
| **Alternatives** | Bare Node install, VM images |
| **Tradeoff** | Image size, linux/amd64 focus |

---

## GitHub Actions

| Aspect | Rationale |
|--------|-----------|
| **Why** | Native to GitHub repo; Nebula CI standard |
| **Use in PSIS** | Test, build, docker, publish, smoke, report |
| **Alternatives** | GitLab CI, CircleCI |
| **Tradeoff** | Tied to GitHub availability |

---

## Docker Hub

| Aspect | Rationale |
|--------|-----------|
| **Why** | Nebula operator standard; `docker pull` consumption |
| **Use in PSIS** | `taig2k/pitching_sequence_intellegence_system_psis` |
| **Alternatives** | ECR-only, GHCR-only |
| **Tradeoff** | Third-party registry dependency |

---

## Node.js 24

| Aspect | Rationale |
|--------|-----------|
| **Why** | Replit module; Dockerfile base; CI alignment |
| **Use in PSIS** | Build and runtime |
| **Alternatives** | Node 20 LTS |
| **Tradeoff** | Bleeding edge vs features — aligned across stack |

---

## Future AWS Rationale (Planned)

| Service | Potential use |
|---------|---------------|
| **ECS Fargate / App Runner** | Run Hub image without server management |
| **ALB + ACM** | TLS termination |
| **EFS** | Persistent JSON data across task restarts |
| **Secrets Manager** | Future API keys, DB credentials |
| **CloudWatch** | Log aggregation |

**Principle:** AWS hosts the **same** Docker image — no forked build per environment.

See [Deployment_Architecture.md](./Deployment_Architecture.md).

---

## Technologies Explicitly Not Used

| Technology | Why not |
|------------|---------|
| PostgreSQL (runtime) | Scope; JSON sufficient for MVP |
| Kubernetes | Overkill for single-team PA |
| GraphQL | REST + OpenAPI sufficient |
| Redis | No session/cache requirement |
| Terraform (yet) | PE ACI will introduce IaC if needed |

---

## Related

- [Decision_Record.md](./Decision_Record.md)
- [Technical Debt (developer)](../developer/Technical_Debt.md)

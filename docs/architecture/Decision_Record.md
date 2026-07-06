# Decision Record

Architectural Decision Records (ADRs) for PSIS.

Format: Decision → Reason → Alternatives → Tradeoffs → Current Truth

---

## ADR-001: JSON File Persistence

| Field | Value |
|-------|-------|
| **Decision** | Store coaching data in JSON files, not a database |
| **Reason** | Original spec emphasized simplest storage; single-team scale; no DBA ops |
| **Alternatives** | PostgreSQL, SQLite, DynamoDB |
| **Tradeoffs** | (+) Zero infra, easy backup as files, simple deploy (−) No concurrent writers, full-file reads, limited query |
| **Current Truth** | **Active** — `psis_entries.json`, `psis_game_state.json`, `psis_sessions.json` |

---

## ADR-002: Pure Game Logic Library

| Field | Value |
|-------|-------|
| **Decision** | Extract all EABR rules to `lib/psis-game-logic` |
| **Reason** | Same rules needed in API and tests; avoid duplication bugs |
| **Alternatives** | Rules only in API; rules only in tests |
| **Tradeoffs** | (+) Testable, portable (−) Extra package boundary |
| **Current Truth** | **Active** — scenario tests import lib directly |

---

## ADR-003: OpenAPI Contract + Codegen

| Field | Value |
|-------|-------|
| **Decision** | `openapi.yaml` drives Zod schemas and React Query hooks via Orval |
| **Reason** | Single contract; type safety across stack |
| **Alternatives** | Hand-written types; tRPC |
| **Tradeoffs** | (+) Alignment (−) Codegen step; title field frozen |
| **Current Truth** | **Active** |

---

## ADR-004: Single Docker Container (API + Static UI)

| Field | Value |
|-------|-------|
| **Decision** | Production image runs one Express process serving API and Vite static build |
| **Reason** | Simplest operator experience; matches PA goal; low scale |
| **Alternatives** | Separate frontend container + nginx; CDN + API |
| **Tradeoffs** | (+) One port, one deploy unit (−) Coupled release; API serves static |
| **Current Truth** | **Active** — validated in CI smoke tests |

---

## ADR-005: GitHub Actions as Sole Docker Authority

| Field | Value |
|-------|-------|
| **Decision** | All Docker build/test/publish on GitHub Actions; not developer laptops |
| **Reason** | Reproducible builds; Nebula governance; Windows dev limitations |
| **Alternatives** | Local Docker publish; Jenkins |
| **Tradeoffs** | (+) Consistent environment (−) CI dependency for release |
| **Current Truth** | **Active** |

---

## ADR-006: Docker Hub as Image Registry

| Field | Value |
|-------|-------|
| **Decision** | Publish to `taig2k/pitching_sequence_intellegence_system_psis` |
| **Reason** | Nebula standard; operator `docker pull` consumption |
| **Alternatives** | GitHub Container Registry only; private registry |
| **Tradeoffs** | (+) Simple operator path (−) Public image name; Hub dependency |
| **Current Truth** | **Active** — PA PASS with digest recorded |

---

## ADR-007: Scenario Tests as Release Gate

| Field | Value |
|-------|-------|
| **Decision** | `pnpm run test:psis` required in CI and inside `docker build` |
| **Reason** | EABR correctness is business-critical; tests are executable spec |
| **Alternatives** | Manual QA only; unit tests per function |
| **Tradeoffs** | (+) Strong regression safety (−) Test maintenance burden |
| **Current Truth** | **Active** — 14 scenarios, 96 assertions |

---

## ADR-008: No Authentication (MVP)

| Field | Value |
|-------|-------|
| **Decision** | No user login in current release |
| **Reason** | Scope control; trusted network deployment assumed |
| **Alternatives** | JWT, OAuth, basic auth |
| **Tradeoffs** | (+) Simplicity (−) Anyone with URL can access |
| **Current Truth** | **Active** — document as limitation |

---

## ADR-009: Replit Origin, Docker Production

| Field | Value |
|-------|-------|
| **Decision** | Retain Replit artifact dev model; validate Docker production path in CI |
| **Reason** | Migration cost; CI proves production artifact |
| **Alternatives** | Full Replit-only; rewrite repo layout |
| **Tradeoffs** | (+) Preserved velocity (−) Dual runtime paths; Windows dev quirks |
| **Current Truth** | **Active** |

---

## ADR-010: Immutable Entries (No PATCH)

| Field | Value |
|-------|-------|
| **Decision** | Entries created via POST only; no update endpoint |
| **Reason** | LOB and inning completion computed at creation; simplified model |
| **Alternatives** | PATCH for corrections |
| **Tradeoffs** | (+) Clear audit trail (−) No correction UX |
| **Current Truth** | **Active** |

---

## ADR-011: AWS PE Deferred to Future ACI

| Field | Value |
|-------|-------|
| **Decision** | PA complete on Docker Hub; AWS hosting not in PA scope |
| **Reason** | Phased Nebula delivery (PA before PE) |
| **Alternatives** | Deploy AWS with PA |
| **Tradeoffs** | (+) Clear phase gate (−) No cloud HA yet |
| **Current Truth** | **PA PASS / PE not started**

---

## Decision Status Legend

| Status | Meaning |
|--------|--------|
| **Active** | Currently implemented |
| **Planned** | Approved direction, not built |
| **Superseded** | Replaced — document successor ADR |

When superseding, add new ADR — do not delete history.

---

## Related

- [Technology_Rationale.md](./Technology_Rationale.md)
- `replit.md` — narrative decision history

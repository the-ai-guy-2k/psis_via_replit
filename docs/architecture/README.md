# PSIS Architecture Documentation

**Preserving architectural intent, design decisions, and evolution path for PSIS.**

---

## Purpose

This folder answers **why** PSIS is designed the way it is — not only how to build or operate it. It is the authoritative reference for architects evaluating changes, scaling, security, and Nebula platform alignment.

**Production Artifact status:** PASS  
**Repository:** https://github.com/the-ai-guy-2k/psis_via_replit.git  
**Docker Hub:** `taig2k/pitching_sequence_intellegence_system_psis`  
**Architecture review:** [Architecture_Review.md](./Architecture_Review.md) (2026-07-06) — **PASS**

---

## Current Truth (Architect Snapshot)

| Dimension | Current state |
|-----------|---------------|
| **Deployment phase** | PA PASS; PE not started |
| **Runtime** | Single Docker container (Express + static React) |
| **Persistence** | JSON files (`psis_entries`, `psis_game_state`, `psis_sessions`) |
| **Auth** | None — trusted-network assumption |
| **CI/CD** | GitHub Actions → Docker Hub (`latest` + commit SHA) |
| **Domain authority** | `lib/psis-game-logic` + scenario tests |
| **API contract** | OpenAPI → Zod + React Query codegen |

---

## Intended Audience

- Solution architects
- Software architects
- Technical leads
- Senior engineers planning structural change
- Future Nebula architects inheriting the system

**Not primary audience:** junior/mid implementers (see developer docs), operators, or managers.

---

## Reading Order

| # | Document | Focus |
|---|----------|-------|
| 1 | [Architecture_Principles.md](./Architecture_Principles.md) | Guiding values |
| 2 | [System_Context.md](./System_Context.md) | Problem, actors, boundaries |
| 3 | [Logical_Architecture.md](./Logical_Architecture.md) | Software structure |
| 4 | [Application_Architecture.md](./Application_Architecture.md) | Layers and modules |
| 5 | [Data_Architecture.md](./Data_Architecture.md) | Persistence and lifecycle |
| 6 | [Physical_Architecture.md](./Physical_Architecture.md) | Repo, container, registries |
| 7 | [Deployment_Architecture.md](./Deployment_Architecture.md) | PA → PAPE → PAPEV |
| 8 | [Decision_Record.md](./Decision_Record.md) | ADRs |
| 9 | [Technology_Rationale.md](./Technology_Rationale.md) | Stack choices |
| 10 | [Security_Architecture.md](./Security_Architecture.md) | Posture and gaps |
| 11 | [Scalability_Roadmap.md](./Scalability_Roadmap.md) | Evolution stages |
| 12 | [Future_Architecture.md](./Future_Architecture.md) | Long-term vision |
| 13 | [Architecture_Review.md](./Architecture_Review.md) | Independent review and gaps closed |

---

## Relationship to Developer Documentation

| Need | Read |
|------|------|
| **Why** (intent, tradeoffs, evolution) | `docs/architecture/` (this folder) |
| **How** (build, extend, debug) | [docs/developer/](../developer/README.md) |
| **How** (day-to-day implementation) | [docs/developer-mid/](../developer-mid/README.md) |
| **Historical narrative** | `replit.md` (repo root) |
| **Deploy / run** | [docs/operator/](../operator/README.md) |
| **Business ops** | [docs/manager/](../manager/README.md) |

Architecture docs **do not replace** developer guides — they inform structural decisions those guides assume.

---

## Nebula Lifecycle Context

```
PA    Production Artifact     — Docker image on Hub (ACHIEVED)
PE    Production Environment  — AWS/hosted runtime (PLANNED)
PAPE  PA published + PE ready
PAPEV Full validation         — end-to-end verified in production environment
```

See [Deployment_Architecture.md](./Deployment_Architecture.md).

---

## Document Maintenance

Update architecture docs when:

- A structural decision changes (new persistence, auth, split services)
- PA/PE phase completes (update Current Truth in Decision Record)
- Security posture materially changes
- Nebula platform standards evolve

Implementation-only changes do not require architecture updates unless they alter boundaries or tradeoffs.

---

## Document Control

| Field | Value |
|-------|-------|
| **ACI** | ACI-009 — Architecture Documentation |
| **Last reviewed** | 2026-07-06 |
| **Review outcome** | PASS — see [Architecture_Review.md](./Architecture_Review.md) |
| **PA reference** | Digest `sha256:6049370cb7821985e140985aafbb1097bf8e8e5f2700ce3770d40a6e5504c217` |
| **Maintainer** | Update on structural change or phase completion |

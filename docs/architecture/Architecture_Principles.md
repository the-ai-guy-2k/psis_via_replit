# Architecture Principles

Guiding principles for PSIS design and evolution.

---

## 1. Simple Before Complex

Start with the smallest architecture that satisfies coaching workflow requirements. PSIS intentionally uses flat JSON files and a single container rather than premature microservices or cloud databases.

**Implication:** Add complexity only when evidence demands it (data volume, concurrency, multi-tenant needs).

---

## 2. Business Logic Separated from UI

All EABR and game-state calculations live in `@workspace/psis-game-logic` — pure TypeScript with no Express or React dependencies.

**Implication:** UI displays; server validates and persists; lib computes. Never duplicate rules across layers.

---

## 3. Shared Logic Reused

Game logic is imported by both the API server and scenario tests. OpenAPI drives shared Zod types and React Query hooks.

**Implication:** One source of truth per concern — contract, rules, validation.

---

## 4. Evidence-Driven Development

Scenario tests (`pnpm run test:psis`) define EABR truth. CI and Docker build fail if scenarios fail.

**Implication:** Architectural changes to scoring must include test evidence before publication.

---

## 5. CI-First Validation

Docker build, smoke tests, and Hub publish occur exclusively in GitHub Actions — not on developer laptops as authority.

**Implication:** Pipeline is part of the architecture, not an afterthought.

---

## 6. Container-First Deployment

The Production Artifact is a Docker image on Docker Hub. Operators consume the image; they do not build from source.

**Implication:** Dockerfile and CI are first-class architecture artifacts alongside application code.

---

## 7. Incremental Evolution

PSIS evolved from a Replit pnpm workspace to a validated PA without rewriting the application. Future AWS PE, database migration, and auth are planned as **phased ACIs**, not big-bang rewrites.

**Implication:** Preserve extension points; document Current Truth at each phase boundary.

---

## 8. Audience-Specific Documentation

Architecture, developer, operator, and manager documentation are separated by audience to reduce cognitive load and prevent operators from reading game-logic internals.

**Implication:** Changes that affect multiple audiences update multiple doc trees deliberately.

---

## 9. Contract-First API

OpenAPI (`lib/api-spec/openapi.yaml`) is the API contract source of truth. Codegen propagates types to server and client.

**Implication:** API changes begin with contract revision, not ad hoc route edits.

---

## 10. Fail Closed on Quality Gates

Failed tests, failed builds, or failed smoke tests block image publication. No manual bypass of CI for `main`.

**Implication:** Production Artifact integrity is architectural invariant.

---

## Anti-Principles (Explicitly Avoided)

| Avoid | Reason |
|-------|--------|
| Client-trusted scoring fields | Data integrity |
| Microservices for current scale | Operational overhead |
| Database before proven need | Original spec + simplicity |
| Local Docker as release authority | Nebula governance |
| Editing generated code | Drift from contract |

---

## Principle Conflicts and Resolution

| Tension | Resolution |
|---------|------------|
| Replit dev vs Docker prod | CI validates Docker path; Replit remains dev convenience |
| Single container vs scale | Split only when metrics justify |
| JSON vs query needs | Migrate persistence layer, keep game-logic pure |

See [Decision_Record.md](./Decision_Record.md).

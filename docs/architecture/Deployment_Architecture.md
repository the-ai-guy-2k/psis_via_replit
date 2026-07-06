# Deployment Architecture

PA, PE, PAPE, PAPEV and deployment sequences.

---

## Nebula Deployment Phases

| Phase | Name | PSIS Status |
|-------|------|-------------|
| **PA** | Production Artifact | **PASS** — image on Docker Hub |
| **PE** | Production Environment | **Not started** — AWS/hosting |
| **PAPE** | PA + PE integrated | Future |
| **PAPEV** | End-to-end validated | Future |

---

## Current Deployment (PA)

```mermaid
flowchart LR
    Dev[Developer] -->|git push main| GH[GitHub]
    GH -->|Actions| GHA[CI Pipeline]
    GHA -->|test build smoke| GHA
    GHA -->|docker push| DH[Docker Hub]
    Op[Operator] -->|docker pull| DH
    Op -->|docker run| Host[Host :8080]
    Coach[Coach] -->|browser| Host
```

---

## GitHub Actions Deployment Sequence

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant CI as Actions Runner
    participant DH as Docker Hub

    Dev->>GH: push main
    GH->>CI: trigger workflow
    CI->>CI: pnpm install
    CI->>CI: test:psis
    CI->>CI: pnpm build
    CI->>CI: docker build
    CI->>CI: smoke test (local image)
    CI->>DH: docker login
    CI->>DH: push latest + sha
    CI->>DH: pull latest
    CI->>CI: smoke test (published image)
    CI->>CI: upload PA report artifact
```

---

## Operator Deployment Sequence

```mermaid
sequenceDiagram
    participant Op as Operator
    participant DH as Docker Hub
    participant Host as Docker Host
    participant Coach as Coach

    Op->>DH: docker pull latest
    Op->>Host: docker run -p 8080:8080
    Op->>Host: optional volume mount data/
    Coach->>Host: http://host:8080
    Coach->>Host: GET /api/healthz
```

See [operator docs](../operator/PSIS_Operator_Installation_Guide.md).

---

## Future AWS PE Deployment (Planned)

```mermaid
flowchart TB
    subgraph CI["Existing CI"]
        GHA[GitHub Actions] --> DH[Docker Hub]
    end

    subgraph PE["Future PE"]
        ECS[ECS Service]
        ALB[ALB + ACM]
        EFS[EFS for JSON data]
    end

    DH -->|pull| ECS
    ECS --> EFS
    ALB --> ECS
    Users[Coaches] --> ALB
```

**PE ACI will define:** service definition, health checks, persistence, TLS, secrets — without changing PA image build semantics.

---

## PAPE / PAPEV Criteria (Architectural)

| Milestone | Criteria |
|-----------|----------|
| **PAPE** | Same Docker image runs in AWS PE; data persists; health checks pass |
| **PAPEV** | Coach workflow validated in PE; backup/restore tested; ops runbook complete |

---

## Deployment Invariants

1. `main` merge triggers publication — no manual image tag on laptop
2. Scenario tests gate Docker build (inside Dockerfile too)
3. Published image smoke-tested after Hub push
4. `PORT=8080` and `NODE_ENV=production` at runtime
5. Health check: `GET /api/healthz`

---

## Rollback Strategy (Current)

| Method | Action |
|--------|--------|
| Image tag | Pull `taig2k/...:<previous-sha>` |
| `latest` | Points to last successful `main` — verify digest before rollback |
| Data | Volume backup independent of image version |

No blue/green until PE phase.

---

## Environment Matrix

| Environment | Image source | Data | TLS |
|-------------|--------------|------|-----|
| CI smoke | Local build / Hub | Ephemeral | No |
| Operator laptop | Hub `latest` | Optional volume | No |
| Future AWS PE | Hub tag | EFS/EBS | ALB |

---

## Related

- [CI/CD Pipeline (developer)](../developer/CI_CD_Pipeline.md)
- [Physical_Architecture.md](./Physical_Architecture.md)

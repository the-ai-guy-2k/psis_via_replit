# PSIS Release Information

Official release and capability information for the PSIS Production Artifact.

---

## Application Name

**PSIS — Pitch Sequence Intelligence System**

A web tool for baseball pitching coaches to log pitch sequences per plate appearance, track Good/Bad/Delta (EABR) outcomes, and review pitching sessions.

---

## Current Version

| Field | Value |
|-------|-------|
| Release channel | Docker Hub `latest` |
| Published image | `taig2k/pitching_sequence_intellegence_system_psis:latest` |
| Image digest (current `latest`) | `sha256:6049370cb7821985e140985aafbb1097bf8e8e5f2700ce3770d40a6e5504c217` |
| Commit-tagged release | `taig2k/pitching_sequence_intellegence_system_psis:49a4528ab9316ba539d1db03b4764a64fa9f8d10` |
| PA validation date | 2026-07-06 |

To inspect the digest of your locally pulled image:

```bash
docker inspect taig2k/pitching_sequence_intellegence_system_psis:latest --format='{{index .RepoDigests 0}}'
```

---

## Production Artifact Status

| Status | Detail |
|--------|--------|
| **PA phase** | **PASS** |
| Docker Hub publish | Validated |
| Independent pull & run | Validated |
| Smoke tests (health, frontend, SPA routes) | Validated on published image |
| Operator documentation | Available in `docs/operator/` |

PSIS exists as a validated, independently consumable Production Artifact published to Docker Hub.

---

## Docker Hub Repository

| Item | Value |
|------|-------|
| Repository | [taig2k/pitching_sequence_intellegence_system_psis](https://hub.docker.com/r/taig2k/pitching_sequence_intellegence_system_psis) |
| Pull command | `docker pull taig2k/pitching_sequence_intellegence_system_psis:latest` |
| Default port | `8080` |
| Health endpoint | `/api/healthz` |

---

## Supported Environment

| Component | Requirement |
|-----------|-------------|
| Host OS | Windows 10/11, macOS, Linux |
| Runtime | Docker Desktop or Docker Engine |
| Browser | Modern Chromium, Firefox, or Safari |
| Database | None (flat JSON file storage inside container or mounted volume) |
| Network | Outbound access to Docker Hub for initial pull |

---

## Current Features

| Feature | Description |
|---------|-------------|
| **Home** | Landing page and application overview |
| **Tracker** (`/track`) | Log plate appearances via progressive outcome wizard |
| **Dashboard** (`/dashboard`) | Review saved pitching sessions and statistics |
| **Game tracking** | Inning, outs, delta, line score, base state |
| **New Game** | Reset live tracker view without deleting historical data |
| **End Session** | Save session summary and start a new game |
| **Health endpoint** | `GET /api/healthz` for monitoring |
| **Validation reports** | Downloadable test reports from Dashboard |

---

## Known Limitations

| Limitation | Detail |
|------------|--------|
| **No user authentication** | Anyone with network access to the URL can use the application |
| **No cloud database** | Data stored as JSON files; mount a volume for persistence |
| **Single-container deployment** | One container serves API and web UI |
| **No HTTPS built-in** | Use a reverse proxy or load balancer for TLS in production |
| **No multi-user roster** | Designed for single-team coaching use |
| **No AI recommendations** | Out of scope for current release |
| **Data loss risk** | Removing the container without a volume mount deletes in-container data |

---

## Current Release Notes

### Release 2026-07-06 — Production Artifact (PA)

- Published Docker image to Docker Hub
- Validated independent consumption (pull → run → smoke test)
- Single-container deployment with Express API and React frontend
- Health endpoint at `/api/healthz`
- Operator documentation package released
- Scenario test suite: 14 scenarios, 96 assertions (validated in CI before publish)

### Application Capabilities in This Release

- EABR progressive click flow for plate appearance logging
- Automatic run and LOB calculation from base-state simulation
- RBI-inclusive bad-unit EABR calculations
- 9-box line score scoreboard
- Session end-of-session summaries with inning and at-bat breakdown
- Dashboard session review with full session detail dialog

---

## Future Roadmap

The following are **not** in the current release and require explicit future approval:

- AWS / cloud-hosted deployment automation (PE phase)
- User authentication and access control
- Cloud database migration
- Player roster / multi-team database
- AI-generated pitching recommendations
- Advanced analytics and charting
- HTTPS termination within the container

Roadmap items are subject to change. Refer to Nebula project governance for prioritization.

---

## Documentation

| Document | Location |
|----------|----------|
| Operator landing page | [README.md](./README.md) |
| Quick Start | [PSIS_Quick_Start.md](./PSIS_Quick_Start.md) |
| Installation Guide | [PSIS_Operator_Installation_Guide.md](./PSIS_Operator_Installation_Guide.md) |
| Troubleshooting | [PSIS_Troubleshooting.md](./PSIS_Troubleshooting.md) |

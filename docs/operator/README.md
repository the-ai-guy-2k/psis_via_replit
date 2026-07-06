# PSIS Operator Documentation

**Pitch Sequence Intelligence System — Production Artifact (PA) Consumption Guide**

This folder contains everything an IT technician or system administrator needs to deploy and operate PSIS using the published Docker image. You do not need access to source code, GitHub, or development tools.

---

## Intended Audience

- IT technicians
- System administrators
- Operations staff supporting baseball coaching tools

This documentation is **not** intended for application developers. Developers should refer to the repository root and `replit.md` for architecture and build information.

---

## Documentation Overview

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [PSIS_Quick_Start.md](./PSIS_Quick_Start.md) | Deploy PSIS in under five minutes | First deployment, proof of concept, quick verification |
| [PSIS_Operator_Installation_Guide.md](./PSIS_Operator_Installation_Guide.md) | Complete step-by-step installation | Standard production or lab deployment |
| [PSIS_Troubleshooting.md](./PSIS_Troubleshooting.md) | Diagnose and fix common problems | Something is not working |
| [PSIS_Release_Information.md](./PSIS_Release_Information.md) | Version, features, limitations, release notes | Planning, change management, support handoff |

---

## Recommended Reading Order

1. **Quick Start** — Get PSIS running immediately.
2. **Installation Guide** — Follow the full procedure for a supported deployment.
3. **Troubleshooting** — Use when a step fails or the application is unreachable.
4. **Release Information** — Review capabilities, limitations, and current release details.

---

## Production Artifact Summary

| Item | Value |
|------|-------|
| Docker Hub image | `taig2k/pitching_sequence_intellegence_system_psis` |
| Default tag | `latest` |
| Default application URL | `http://localhost:8080` |
| Health check URL | `http://localhost:8080/api/healthz` |
| PA status | **PASS** — independently consumable from Docker Hub |

---

## Minimum Requirements

- Docker Desktop installed and running (Windows or macOS)
- Internet access to pull the image from Docker Hub
- Port **8080** available on the host (or choose an alternate port — see Installation Guide)
- A modern web browser (Chrome, Edge, Firefox, or Safari)

---

## Start Here

**New to PSIS?** Open [PSIS_Quick_Start.md](./PSIS_Quick_Start.md) and follow the steps. You should have the application open in your browser within five minutes.

# PSIS Operator Installation Guide

Complete installation instructions for deploying PSIS from the published Docker Hub Production Artifact.

---

## Executive Summary

PSIS (Pitch Sequence Intelligence System) is a web application for baseball pitching coaches. It runs as a single Docker container that serves both the web interface and the API. No database server, compiler, or source code is required on the host — only Docker Desktop.

| Item | Value |
|------|-------|
| Image | `taig2k/pitching_sequence_intellegence_system_psis:latest` |
| Application URL | `http://localhost:8080` |
| Health endpoint | `http://localhost:8080/api/healthz` |
| Container port | `8080` |

---

## Supported Operating Systems

| OS | Support | Notes |
|----|---------|-------|
| Windows 10 / 11 | Supported | Docker Desktop required |
| macOS (Intel and Apple Silicon) | Supported | Docker Desktop required |
| Linux | Supported | Docker Engine or Docker Desktop |

This guide uses Windows examples where shell syntax differs. macOS and Linux users can use the same `docker` commands shown in the bash sections.

---

## Prerequisites

1. **Docker Desktop** installed from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. **Administrator rights** to install Docker Desktop (one-time)
3. **Network access** to Docker Hub (`hub.docker.com`)
4. **Port 8080** available on the host (or plan an alternate port — see below)
5. A **modern web browser**

---

## Install Docker Desktop

1. Download Docker Desktop for your operating system.
2. Run the installer and accept defaults.
3. Restart the computer if prompted.
4. Launch Docker Desktop and wait until it reports **Running**.

---

## Verify Docker Installation

Open PowerShell (Windows) or Terminal (macOS) and run:

```bash
docker --version
docker info
```

Both commands should succeed without error. If `docker info` reports that the daemon is not running, start Docker Desktop and wait one minute, then retry.

---

## Pull the PSIS Image

```bash
docker pull taig2k/pitching_sequence_intellegence_system_psis:latest
```

Confirm the image is present:

```bash
docker images taig2k/pitching_sequence_intellegence_system_psis
```

---

## Run PSIS

### Standard run (recommended for evaluation)

**Windows (Command Prompt):**

```bat
docker run -d --name psis -p 8080:8080 -e PORT=8080 -e NODE_ENV=production taig2k/pitching_sequence_intellegence_system_psis:latest
```

**Windows (PowerShell) — multi-line:**

```powershell
docker run -d `
  --name psis `
  -p 8080:8080 `
  -e PORT=8080 `
  -e NODE_ENV=production `
  taig2k/pitching_sequence_intellegence_system_psis:latest
```

**Command Prompt multi-line (as specified for Windows operators):**

```bat
docker run -d ^
  --name psis ^
  -p 8080:8080 ^
  -e PORT=8080 ^
  -e NODE_ENV=production ^
  taig2k/pitching_sequence_intellegence_system_psis:latest
```

**macOS / Linux:**

```bash
docker run -d \
  --name psis \
  -p 8080:8080 \
  -e PORT=8080 \
  -e NODE_ENV=production \
  taig2k/pitching_sequence_intellegence_system_psis:latest
```

### One-time foreground run (testing only)

Removes the container automatically when stopped (`--rm`):

```bat
docker run --rm -p 8080:8080 -e PORT=8080 -e NODE_ENV=production taig2k/pitching_sequence_intellegence_system_psis:latest
```

Press `Ctrl+C` to stop. Data created during this session is discarded when the container exits.

---

## Application URL

Open a browser:

| Page | URL |
|------|-----|
| Home | http://localhost:8080 |
| Tracker | http://localhost:8080/track |
| Dashboard | http://localhost:8080/dashboard |

---

## Health Endpoint

| Check | Command or URL |
|-------|----------------|
| Browser | http://localhost:8080/api/healthz |
| curl (macOS/Linux) | `curl http://localhost:8080/api/healthz` |
| PowerShell (Windows) | `(Invoke-WebRequest -Uri http://localhost:8080/api/healthz -UseBasicParsing).Content` |

**Expected response (HTTP 200):**

```json
{"status":"ok"}
```

Use this endpoint for load balancer health checks and automated monitoring.

---

## Persist Coaching Data (Recommended for Production)

By default, PSIS stores data in JSON files inside the container. **Data is lost if the container is removed** unless you mount a host directory.

**Windows (PowerShell):**

```powershell
mkdir C:\psis-data -Force
docker run -d `
  --name psis `
  -p 8080:8080 `
  -e PORT=8080 `
  -e NODE_ENV=production `
  -v C:\psis-data:/app/artifacts/api-server/data `
  taig2k/pitching_sequence_intellegence_system_psis:latest
```

**macOS / Linux:**

```bash
mkdir -p ~/psis-data
docker run -d \
  --name psis \
  -p 8080:8080 \
  -e PORT=8080 \
  -e NODE_ENV=production \
  -v ~/psis-data:/app/artifacts/api-server/data \
  taig2k/pitching_sequence_intellegence_system_psis:latest
```

Back up the mounted folder regularly.

---

## Use a Different Host Port

If port 8080 is already in use, map host port **9080** (example) to container port **8080**:

```bash
docker run -d --name psis -p 9080:8080 -e PORT=8080 -e NODE_ENV=production taig2k/pitching_sequence_intellegence_system_psis:latest
```

Application URL: **http://localhost:9080**

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Yes | `8080` | Port the application listens on inside the container |
| `NODE_ENV` | Recommended | `production` | Enables production mode |
| `LOG_LEVEL` | No | `info` | Log verbosity (`info`, `debug`, `warn`, `error`) |
| `BASE_PATH` | No | `/` | URL base path (leave as `/` for standard deployments) |

---

## Viewing Logs

```bash
docker logs psis
```

Follow live logs:

```bash
docker logs -f psis
```

---

## Restarting PSIS

```bash
docker restart psis
```

---

## Stopping PSIS

```bash
docker stop psis
```

---

## Updating PSIS

```bash
docker stop psis
docker rm psis
docker pull taig2k/pitching_sequence_intellegence_system_psis:latest
```

Then run the `docker run` command again (include the same `-v` volume mount if you use persistent data).

---

## Removing Old Images

List images:

```bash
docker images taig2k/pitching_sequence_intellegence_system_psis
```

Remove an unused image by ID or tag:

```bash
docker rmi taig2k/pitching_sequence_intellegence_system_psis:<old-tag>
```

Prune dangling images:

```bash
docker image prune
```

---

## Verify Deployment Checklist

- [ ] `docker ps` shows container `psis` with status **Up**
- [ ] http://localhost:8080 loads the PSIS home page
- [ ] http://localhost:8080/api/healthz returns `{"status":"ok"}`
- [ ] Tracker page accepts a test entry
- [ ] Data volume mounted (if production use)

---

## Next Steps

- **Problems?** See [PSIS_Troubleshooting.md](./PSIS_Troubleshooting.md)
- **Release details?** See [PSIS_Release_Information.md](./PSIS_Release_Information.md)

# PSIS Quick Start

Deploy PSIS in under five minutes using Docker Desktop.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- Docker Desktop **running** (whale icon visible in the system tray/menu bar)
- Port **8080** free on your computer

---

## Step 1 — Pull the Image

Open **PowerShell** (Windows) or **Terminal** (macOS) and run:

```bash
docker pull taig2k/pitching_sequence_intellegence_system_psis:latest
```

Wait until the download completes. First pull may take one to three minutes depending on your connection.

---

## Step 2 — Start PSIS

**Windows (PowerShell or Command Prompt):**

```bat
docker run -d --name psis -p 8080:8080 -e PORT=8080 -e NODE_ENV=production taig2k/pitching_sequence_intellegence_system_psis:latest
```

**macOS / Linux:**

```bash
docker run -d --name psis -p 8080:8080 -e PORT=8080 -e NODE_ENV=production taig2k/pitching_sequence_intellegence_system_psis:latest
```

You should see a long container ID printed. PSIS is now running in the background.

Confirm the container is running:

```bash
docker ps --filter name=psis
```

Status should show **Up**.

---

## Step 3 — Open the Application

Open your web browser and go to:

**http://localhost:8080**

You should see the PSIS home page. Use **Tracker** (`/track`) to log pitch sequences or **Dashboard** (`/dashboard`) to review sessions.

---

## Step 4 — Verify Health (Optional)

**Option A — Browser:** Open http://localhost:8080/api/healthz — you should see:

```json
{"status":"ok"}
```

**Option B — Command line (macOS/Linux or Windows with curl):**

```bash
curl http://localhost:8080/api/healthz
```

**Option C — Windows PowerShell (no curl required):**

```powershell
(Invoke-WebRequest -Uri http://localhost:8080/api/healthz -UseBasicParsing).Content
```

Expected output: `{"status":"ok"}`

---

## Stop PSIS

```bash
docker stop psis
```

---

## Start PSIS Again (After Stop)

```bash
docker start psis
```

---

## Update to the Latest Image

```bash
docker stop psis
docker rm psis
docker pull taig2k/pitching_sequence_intellegence_system_psis:latest
docker run -d --name psis -p 8080:8080 -e PORT=8080 -e NODE_ENV=production taig2k/pitching_sequence_intellegence_system_psis:latest
```

If `docker rm` reports the container does not exist, skip that step and run the pull and `docker run` commands.

---

## Need More Detail?

See the [Installation Guide](./PSIS_Operator_Installation_Guide.md) for persistent data volumes, alternate ports, and production recommendations.

If something fails, see [Troubleshooting](./PSIS_Troubleshooting.md).

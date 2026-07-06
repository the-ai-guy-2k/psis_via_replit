# PSIS Troubleshooting

Solutions for common problems when deploying and operating PSIS from Docker Hub.

---

## Quick Diagnostic Commands

```bash
docker ps -a --filter name=psis
docker logs psis
curl http://localhost:8080/api/healthz
```

---

## Docker Not Installed

**Symptom:** `'docker' is not recognized` or `command not found: docker`

**Solution:**

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Restart the computer if required.
3. Verify: `docker --version`

---

## Docker Desktop Not Running

**Symptom:** `Cannot connect to the Docker daemon` or `error during connect`

**Solution:**

1. Open **Docker Desktop** from the Start menu or Applications folder.
2. Wait until the status shows **Running** (whale icon steady, not animating).
3. Retry: `docker info`

On Windows, ensure WSL 2 backend is enabled if prompted by Docker Desktop.

---

## Port 8080 Already in Use

**Symptom:** `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution — use a different host port:**

```bash
docker run -d --name psis -p 9080:8080 -e PORT=8080 -e NODE_ENV=production taig2k/pitching_sequence_intellegence_system_psis:latest
```

Open **http://localhost:9080** instead.

**Find what is using port 8080 (Windows):**

```powershell
netstat -ano | findstr :8080
```

**Find what is using port 8080 (macOS/Linux):**

```bash
lsof -i :8080
```

---

## Container Name Already in Use

**Symptom:** `Conflict. The container name "/psis" is already in use`

**Solution:**

```bash
docker stop psis
docker rm psis
```

Then run the `docker run` command again.

---

## Container Exits Immediately

**Symptom:** `docker ps` does not list `psis`; `docker ps -a` shows **Exited**

**Solution:**

1. Read the logs:

   ```bash
   docker logs psis
   ```

2. Common causes:
   - **Missing `PORT` environment variable** — always include `-e PORT=8080`
   - **Port conflict** — try a different host port (see above)
   - **Image not pulled** — run `docker pull taig2k/pitching_sequence_intellegence_system_psis:latest`

3. Remove and recreate:

   ```bash
   docker rm psis
   docker run -d --name psis -p 8080:8080 -e PORT=8080 -e NODE_ENV=production taig2k/pitching_sequence_intellegence_system_psis:latest
   ```

---

## Health Endpoint Unavailable

**Symptom:** `curl http://localhost:8080/api/healthz` fails or times out

**Solution:**

1. Confirm the container is running: `docker ps`
2. Wait 10–15 seconds after start — the application may still be initializing.
3. Check logs: `docker logs psis`
4. Confirm you are using the correct host port (8080 or your mapped port).
5. Test from the same machine where Docker is running (not a remote PC unless port forwarding is configured).

**Expected healthy response:**

```json
{"status":"ok"}
```

---

## Frontend Not Loading

**Symptom:** Browser shows connection refused, blank page, or cannot reach site

**Solution:**

| Check | Action |
|-------|--------|
| Container running? | `docker ps` — look for `psis` |
| Correct URL? | `http://localhost:8080` (not `https://`) |
| Correct port? | Match the `-p` host port in your `docker run` command |
| Firewall? | Allow Docker Desktop through Windows Firewall |
| Health OK? | Test `/api/healthz` first |

If health passes but the page is blank, hard-refresh the browser (`Ctrl+F5` or `Cmd+Shift+R`).

---

## API Works but Tracker Shows Errors

**Symptom:** Home page loads; Tracker or Dashboard fail to load data

**Solution:**

1. Verify health: `curl http://localhost:8080/api/healthz`
2. Check browser developer console (F12) for network errors.
3. Ensure you are not mixing ports (e.g., opening port 9080 but API cached on 8080).
4. Restart container: `docker restart psis`

---

## Permission Issues (Volume Mount)

**Symptom:** Container starts but cannot write data; errors in logs about file permissions

**Solution (Windows):**

1. In Docker Desktop → **Settings** → **Resources** → **File Sharing**, ensure your data drive (e.g. `C:\`) is shared.
2. Use a simple path such as `C:\psis-data`.
3. Recreate the container with the volume mount (see Installation Guide).

**Solution (macOS/Linux):**

```bash
chmod 755 ~/psis-data
```

---

## Image Pull Fails

**Symptom:** `Error response from daemon: pull access denied` or network timeout

**Solution:**

1. Verify internet connectivity.
2. Confirm image name is exact:

   ```
   taig2k/pitching_sequence_intellegence_system_psis:latest
   ```

3. Log in to Docker Hub if your organization requires it:

   ```bash
   docker login
   ```

4. Retry the pull.

---

## Image Update Issues

**Symptom:** After `docker pull`, old behavior persists

**Solution:**

Pulling updates the local image but **does not restart a running container**.

```bash
docker stop psis
docker rm psis
docker pull taig2k/pitching_sequence_intellegence_system_psis:latest
docker run -d --name psis -p 8080:8080 -e PORT=8080 -e NODE_ENV=production taig2k/pitching_sequence_intellegence_system_psis:latest
```

Include your `-v` volume flags if you use persistent storage.

---

## Data Lost After Container Removal

**Symptom:** Coaching entries disappeared after `docker rm`

**Cause:** Data was stored inside the container filesystem, not on a mounted volume.

**Solution:** Deploy with a volume mount (see Installation Guide) and back up the host folder regularly.

---

## Useful Docker Commands

| Task | Command |
|------|---------|
| List running containers | `docker ps` |
| List all containers | `docker ps -a` |
| Stop PSIS | `docker stop psis` |
| Start PSIS | `docker start psis` |
| Restart PSIS | `docker restart psis` |
| View logs | `docker logs psis` |
| Follow logs live | `docker logs -f psis` |
| Remove container | `docker rm psis` |
| List images | `docker images` |
| Pull latest image | `docker pull taig2k/pitching_sequence_intellegence_system_psis:latest` |
| Inspect container | `docker inspect psis` |

---

## Still Need Help?

1. Collect output from:
   - `docker ps -a --filter name=psis`
   - `docker logs psis`
   - `curl -v http://localhost:8080/api/healthz`
2. Note your OS, Docker Desktop version, and exact `docker run` command used.
3. See [PSIS_Release_Information.md](./PSIS_Release_Information.md) for known limitations.

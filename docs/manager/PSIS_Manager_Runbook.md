# PSIS Manager Runbook

Operational procedures for managers overseeing PSIS day to day.

**Note:** Steps marked **(IT)** should be performed by or requested from your technical staff. Managers verify outcomes; technicians execute commands.

---

## Normal Operating State

When PSIS is healthy:

| Indicator | Expected State |
|-----------|----------------|
| Web application | Opens at your organization's PSIS URL (record it in [README](./README.md)) |
| Home page | PSIS branding and navigation visible |
| Tracker | Coaches can log a plate appearance |
| Dashboard | Saved sessions visible after End Session |
| Health endpoint | Returns `{"status":"ok"}` |
| Docker container **(IT)** | Container named `psis` (or as configured) shows status **Up** |

### Manager status at a glance

| Status | Meaning | Your action |
|--------|---------|-------------|
| **Green** | Home page loads, health OK, coaches working normally | None |
| **Yellow** | One coach reports an issue; others unaffected | Document issue; retry browser refresh; monitor |
| **Red** | Health check fails or all users affected | Escalate to IT immediately |

---

## Daily Operations

### Manager actions (5 minutes)

1. **Confirm reachability** — Open the PSIS URL in a browser. Home page loads.
2. **Spot-check Tracker** — Ask a coach to confirm they can open Tracker, or open it yourself.
3. **Note issues** — If anyone reports problems, record the time, page, and error message.

### IT verification (if issues reported)

| Check | How **(IT)** |
|-------|----------------|
| Container running | `docker ps --filter name=psis` |
| Health endpoint | Open `/api/healthz` or run health check per [Operator Guide](../operator/PSIS_Operator_Installation_Guide.md) |
| Logs | `docker logs psis` |

### Expected user workflow (coaching session)

1. Coach opens **Tracker**
2. Coach logs plate appearances through the outcome wizard
3. Coach completes innings and may click **End Session** when done
4. Coach or staff opens **Dashboard** to review the saved session

---

## Weekly Review

### Manager actions

| Task | Action |
|------|--------|
| Adoption check | Confirm sessions are being saved (Dashboard shows recent sessions) |
| User feedback | Ask coaches if anything blocked logging this week |
| Issue log | Review any outages or slowdowns reported |

### IT actions **(IT)**

| Task | Command / Action |
|------|------------------|
| Container status | `docker ps --filter name=psis` |
| Disk space | Verify host disk has adequate free space (especially if data volume is used) |
| Log review | `docker logs psis --tail 100` — look for repeated errors |
| Backup confirmation | Confirm data folder backup ran if persistence is configured |

---

## Monthly Review

### Manager actions

| Task | Action |
|------|--------|
| Release review | Read [Release Information](../operator/PSIS_Release_Information.md) or ask IT for current version |
| Capability alignment | Confirm PSIS still meets coaching needs |
| Escalation review | Confirm support contacts are current |

### IT actions **(IT)**

| Task | Action |
|------|--------|
| Image update | Pull `taig2k/pitching_sequence_intellegence_system_psis:latest` and redeploy per [Operator Guide](../operator/PSIS_Operator_Installation_Guide.md) |
| Backup test | Restore a backup copy to verify recoverability (recommended) |
| Security review | Confirm network access restrictions still appropriate (no login in app) |

---

## How to Verify the Application Is Healthy

### Manager-level check (no technical tools)

1. Open your PSIS URL in a browser → home page loads
2. Open **Tracker** → page loads without errors
3. Open health URL in browser: `http://<your-psis-address>/api/healthz`
4. Confirm you see: `{"status":"ok"}`

If all four pass, PSIS is **likely healthy** from a user perspective.

### IT-level check

| Check | Pass Criteria |
|-------|---------------|
| Health endpoint | HTTP 200, body contains `"status":"ok"` |
| Frontend | `GET /` returns PSIS home page |
| SPA routes | `GET /track` loads Tracker |
| Container **(IT)** | `docker ps` shows container **Up** |

---

## Health Endpoint

| Item | Value |
|------|-------|
| Path | `/api/healthz` |
| Full example | `http://localhost:8080/api/healthz` |
| Expected response | `{"status":"ok"}` |
| Used for | Monitoring, load balancers, IT automation |

Managers can verify in a browser. IT may use automated monitoring on this URL.

---

## Docker Container Verification **(IT)**

Managers do not need to run these commands. Request IT verification when health checks fail.

```bash
docker ps --filter name=psis
docker logs psis --tail 50
```

**Pass:** Container status is **Up**, logs show no crash loop, health endpoint OK.

---

## Backup Expectations

| Topic | Manager Expectation |
|-------|---------------------|
| **Who owns backups** | IT / operations — not coaches |
| **What is backed up** | Coaching data files (entries, game state, sessions) |
| **How often** | Agree with IT — recommend at least weekly for active programs |
| **Without backup** | Data may be lost if the container or host is replaced |
| **Your action** | Confirm with IT that a backup process exists and is tested |

Ask IT: *"Is the PSIS data folder backed up, and when was the last successful restore test?"*

---

## Update Process

PSIS updates are delivered as new Docker images on Docker Hub. **Managers do not apply updates directly.**

### Recommended update workflow

1. **Manager** — Schedule a maintenance window (low-usage time)
2. **IT** — Pull latest image and redeploy per [Operator Installation Guide](../operator/PSIS_Operator_Installation_Guide.md)
3. **IT** — Verify health endpoint and smoke-test Tracker
4. **Manager** — Confirm coaches can resume normal use
5. **Manager** — Review release notes for new features or limitations

### After an update

- Existing data should remain if IT used a persistent volume mount
- Coaches may need a browser refresh (`Ctrl+F5` / `Cmd+Shift+R`)
- Escalate to IT if data is missing or pages fail to load

---

## Escalation Process

### Level 1 — Manager (you)

- Verify URL and browser access
- Confirm whether the issue affects one user or everyone
- Check health URL in browser
- Document: time, symptoms, affected pages

### Level 2 — IT / Technical staff

Escalate when:

- Health endpoint does not return OK
- Application unreachable for multiple users
- Data loss suspected
- Update or installation needed

**Provide to IT:**

- PSIS URL in use
- Screenshot or description of error
- Whether issue started after restart or update
- Link to [Operator Troubleshooting](../operator/PSIS_Troubleshooting.md)

### Level 3 — Vendor / development team

Escalate through your organization's channel when:

- IT confirms infrastructure is healthy but application behavior is incorrect
- Suspected software defect (calculation errors, data corruption)
- Feature request for a future release

---

## Quick Reference

| Need | Document |
|------|----------|
| Management overview | [PSIS_Manager_Guide.md](./PSIS_Manager_Guide.md) |
| Common questions | [PSIS_Manager_FAQ.md](./PSIS_Manager_FAQ.md) |
| Verification checklists | [PSIS_Operations_Checklist.md](./PSIS_Operations_Checklist.md) |
| IT installation | [Operator Guide](../operator/PSIS_Operator_Installation_Guide.md) |
| IT troubleshooting | [Operator Troubleshooting](../operator/PSIS_Troubleshooting.md) |

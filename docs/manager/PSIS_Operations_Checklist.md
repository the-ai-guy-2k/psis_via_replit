# PSIS Operations Checklist

Manager verification checklists for PSIS. Mark each item **Done** or **Failed**.

**Instructions:**

- **Manager checks** — You can perform these in a browser.
- **IT checks** — Request your technical staff to perform and confirm.
- Record the date and person completing each review.

---

## Daily Checklist

**Date:** _______________  
**Reviewer:** _______________  
**PSIS URL:** _______________

| # | Check | Manager | Result |
|---|-------|---------|--------|
| 1 | Application reachable — home page loads in browser | ☐ | PASS / FAIL |
| 2 | Health endpoint OK — `/api/healthz` shows `{"status":"ok"}` | ☐ | PASS / FAIL |
| 3 | Users can access Tracker (`/track` loads) | ☐ | PASS / FAIL |
| 4 | Sessions save correctly — coach confirms End Session appears on Dashboard | ☐ | PASS / FAIL |
| 5 | No outstanding user-reported errors today | ☐ | PASS / FAIL |

### Daily Result

| Overall | Mark one |
|---------|----------|
| **PASS** | All items PASS |
| **FAIL** | One or more items FAIL — escalate to IT per [Runbook](./PSIS_Manager_Runbook.md) |

**Notes:**

_______________________________________________________________________________

_______________________________________________________________________________

---

## Weekly Checklist

**Date:** _______________  
**Reviewer:** _______________

### Manager review

| # | Check | Result |
|---|-------|--------|
| 1 | Coaches used PSIS during scheduled sessions this week | PASS / FAIL |
| 2 | Dashboard shows expected saved sessions | PASS / FAIL |
| 3 | User issues documented and addressed or escalated | PASS / FAIL |

### IT review (request confirmation)

| # | Check | IT Initial | Result |
|---|-------|------------|--------|
| 4 | Container status **Up** (`docker ps`) | ________ | PASS / FAIL |
| 5 | Disk utilization acceptable on host | ________ | PASS / FAIL |
| 6 | Logs reviewed — no recurring errors | ________ | PASS / FAIL |
| 7 | Data backup completed per schedule | ________ | PASS / FAIL |

### Weekly Result

| Overall | Mark one |
|---------|----------|
| **PASS** | All items PASS |
| **FAIL** | One or more items FAIL — see [Runbook escalation](./PSIS_Manager_Runbook.md) |

**Notes:**

_______________________________________________________________________________

---

## Monthly Checklist

**Date:** _______________  
**Reviewer:** _______________

### Manager review

| # | Check | Result |
|---|-------|--------|
| 1 | Release notes reviewed (current version documented) | PASS / FAIL |
| 2 | PSIS capabilities still meet program needs | PASS / FAIL |
| 3 | Support contacts and escalation path confirmed current | PASS / FAIL |

### IT review (request confirmation)

| # | Check | IT Initial | Result |
|---|-------|------------|--------|
| 4 | Latest image pulled from Docker Hub | ________ | PASS / FAIL |
| 5 | Update applied during maintenance window (if new release) | ________ | PASS / FAIL |
| 6 | Health and smoke test passed after update | ________ | PASS / FAIL |
| 7 | Backups verified (restore test recommended) | ________ | PASS / FAIL |

### Monthly Result

| Overall | Mark one |
|---------|----------|
| **PASS** | All items PASS |
| **FAIL** | One or more items FAIL |

**Current version (IT):** _______________  
**Last backup verified:** _______________

**Notes:**

_______________________________________________________________________________

---

## Health Check Quick Reference

| Check | URL / Action | Pass |
|-------|--------------|------|
| Application | Open PSIS home URL | Page loads |
| Health | `<PSIS-URL>/api/healthz` | `{"status":"ok"}` |
| Tracker | `<PSIS-URL>/track` | Tracker page loads |
| Dashboard | `<PSIS-URL>/dashboard` | Dashboard page loads |

---

## Escalation Reminder

| Result | Action |
|--------|--------|
| **PASS** | Continue normal operations |
| **FAIL** | Document failure, notify IT, reference [Troubleshooting](../operator/PSIS_Troubleshooting.md) |

---

## Related Documents

- [PSIS_Manager_Runbook.md](./PSIS_Manager_Runbook.md)
- [PSIS_Manager_FAQ.md](./PSIS_Manager_FAQ.md)
- [Operator Documentation](../operator/README.md) (for IT)

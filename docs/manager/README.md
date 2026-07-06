# PSIS Manager Documentation

**Pitch Sequence Intelligence System — Management & Operations Overview**

This folder is for **managers and business stakeholders**, not developers or IT technicians.

---

## Intended Audience

- Team managers
- IT managers
- Operations managers
- Business owners

If you need step-by-step deployment instructions, refer your technical staff to **[Operator Documentation](../operator/README.md)**.

---

## What This Documentation Covers

| Document | Purpose | Read When |
|----------|---------|-----------|
| [PSIS_Manager_Guide.md](./PSIS_Manager_Guide.md) | What PSIS is, why it exists, business value, limitations, and your responsibilities | First read — orientation |
| [PSIS_Manager_Runbook.md](./PSIS_Manager_Runbook.md) | Daily, weekly, and monthly operations; health checks; escalation | Ongoing operations |
| [PSIS_Manager_FAQ.md](./PSIS_Manager_FAQ.md) | Short answers to common management questions | Quick reference |
| [PSIS_Operations_Checklist.md](./PSIS_Operations_Checklist.md) | Printable verification checklists with PASS/FAIL | Routine reviews |

---

## Recommended Reading Order

1. **Manager Guide** — Understand purpose, value, and expectations.
2. **FAQ** — Resolve common questions quickly.
3. **Runbook** — Learn how operations work day to day.
4. **Operations Checklist** — Use during daily, weekly, and monthly reviews.

---

## At a Glance

| Item | Detail |
|------|--------|
| Application | PSIS — Pitch Sequence Intelligence System |
| Purpose | Help pitching coaches log sequences and review session outcomes |
| How it runs | Single Docker container (installed and maintained by IT) |
| **Your PSIS URL** | _Record here: _______________________________ |
| Health check | `<your-psis-url>/api/healthz` should return `{"status":"ok"}` |
| Production Artifact status | **PASS** — published and validated on Docker Hub |
| Technical documentation | [docs/operator/](../operator/README.md) (hand this to IT staff) |

---

## Support Contacts

Record your organization's contacts so managers know who to call:

| Role | Name | Contact |
|------|------|---------|
| IT / Technical support | | |
| PSIS business owner | | |
| Escalation (vendor / dev team) | | |

---

## When to Involve Technical Staff

Contact your IT technician or system administrator when:

- The application cannot be opened in a browser
- The health check does not return OK
- Data appears missing after a restart or update
- You need PSIS installed, updated, or moved to a new computer or server

You do **not** need to understand Docker, GitHub, or source code to manage PSIS usage — only to recognize when technical support is needed.

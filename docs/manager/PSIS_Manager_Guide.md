# PSIS Manager Guide

A non-technical overview of PSIS for managers and business stakeholders.

---

## Executive Summary

**PSIS (Pitch Sequence Intelligence System)** is a web application that helps baseball pitching coaches record what happened during each plate appearance — pitch sequences, defensive and offensive outcomes, and session-level results — then review that information on a dashboard.

PSIS is delivered as a **Production Artifact**: a tested, published software package that your IT team installs from Docker Hub. It does not require custom development for day-to-day use.

**Your role as a manager:** Ensure coaches can access PSIS, confirm it is working, understand what it can and cannot do, and escalate to technical staff when it is not.

---

## Business Problem

Pitching coaches need a consistent way to:

- Log pitch sequences and plate-appearance outcomes during practice or games
- Track good vs. bad outcomes using the organization's EABR (End of At-Bat Result) framework
- Review session performance over time without spreadsheets or handwritten notes

Without a dedicated tool, this information is scattered, inconsistent, and hard to summarize for coaching decisions.

---

## Why PSIS Exists

PSIS was built to give coaches a **single, structured place** to:

1. **Track** — Log each plate appearance through a guided outcome workflow
2. **Measure** — See inning deltas, line scores, and session summaries
3. **Review** — Open saved pitching sessions on the dashboard

It replaces ad hoc note-taking with a repeatable process aligned to your coaching methodology.

### What is a "session" in PSIS?

A **session** is one coaching unit — typically a practice or game segment — that coaches close using **End Session** on the Tracker. After ending a session, a summary is saved and appears on the **Dashboard** for review. Managers should expect coaches to end sessions so data is preserved for review.

---

## Operational Benefits

| Benefit | What It Means for Your Organization |
|---------|-----------------------------------|
| **Consistency** | Every coach uses the same outcome categories and calculations |
| **Immediate feedback** | Live inning and game status visible during sessions |
| **Session history** | Completed sessions saved and reviewable on the dashboard |
| **Low infrastructure** | Runs as one container — no separate database server to license |
| **Validated release** | Published image tested before distribution on Docker Hub |
| **Clear support path** | Operator documentation exists for your IT team |

---

## What Managers Should Expect

### Normal operation

- Coaches open PSIS in a web browser
- The **Tracker** page is used during live sessions
- The **Dashboard** page is used to review saved sessions
- The application responds quickly on a properly configured computer or server
- No software installation is required **on coach laptops** — only a browser and network access to the PSIS address

### What PSIS does not do today

- User login or password protection (anyone with the URL can use it)
- Multi-team roster management
- Cloud hosting by itself (your IT team decides where it runs)
- AI recommendations or advanced analytics
- Automatic off-site backup (must be arranged by IT if required)

---

## Current Capabilities

| Area | Capability |
|------|------------|
| **Home** | Overview and navigation |
| **Tracker** | Log plate appearances with progressive outcome wizard |
| **Dashboard** | View saved pitching sessions with full detail |
| **Game management** | New Game reset, inning tracking, line score |
| **Sessions** | End Session summary with statistics and at-bat history |
| **Health monitoring** | Automated health endpoint for IT verification |
| **Validation reports** | Downloadable reports from the Dashboard |

---

## Current Limitations

| Limitation | Management Impact |
|------------|-------------------|
| No user accounts | Restrict network access to trusted users if PSIS is on a shared network |
| Local or single-host deployment | Availability depends on the machine or server where IT installed it |
| JSON file storage | Data persistence depends on IT configuring backup and storage correctly |
| No built-in HTTPS | IT should place PSIS behind secure access if used outside a trusted lab |
| Single-team focus | Not designed for league-wide multi-roster operations |

---

## How Success Is Measured

PSIS is successful when:

| Measure | Target |
|---------|--------|
| **Availability** | Coaches can open PSIS during scheduled sessions |
| **Adoption** | Coaches consistently log plate appearances in the Tracker |
| **Data quality** | Sessions are ended properly and appear on the Dashboard |
| **Review usage** | Coaching staff uses Dashboard session history for feedback |
| **Technical health** | Health endpoint returns OK (verified by IT or per checklist) |

Success is **not** measured by coaches interacting with Docker or deployment tools.

---

## Who Uses PSIS

| Role | Typical Use |
|------|-------------|
| **Pitching coaches** | Log sequences and outcomes during practice or games (Tracker) |
| **Head coach / coordinator** | Review session summaries and trends (Dashboard) |
| **Team manager** | Confirm tool availability; ensure adoption |
| **IT staff** | Install, update, back up, and troubleshoot the container |
| **Operations / business owner** | Governance, release planning, escalation oversight |

---

## Manager Responsibilities

| Responsibility | Action |
|----------------|--------|
| **Access** | Confirm coaches know the PSIS web address |
| **Adoption** | Encourage consistent logging and session completion |
| **Verification** | Use the [Operations Checklist](./PSIS_Operations_Checklist.md) or ask IT to confirm health |
| **Communication** | Report outages or data concerns to IT promptly |
| **Governance** | Understand limitations (no login, backup depends on IT) |
| **Updates** | Coordinate with IT for scheduled image updates — not self-service |

---

## When Technical Support Is Required

**You can handle (no IT required):**

- Showing coaches how to open the Tracker and Dashboard
- Confirming the browser URL is correct
- Reporting what error or behavior coaches see

**Escalate to IT / technical staff:**

| Situation | Escalate |
|-----------|----------|
| Browser cannot reach PSIS | Yes |
| Health check fails | Yes |
| Application was working, now shows errors for everyone | Yes |
| Data missing after restart or update | Yes |
| Need PSIS on a new machine or server | Yes |
| Need backups or network security | Yes |
| Need software update to latest release | Yes |

**Direct IT to:** [Operator Documentation](../operator/README.md)

---

## Related Documents

- [PSIS_Manager_Runbook.md](./PSIS_Manager_Runbook.md) — Operational rhythm and escalation
- [PSIS_Manager_FAQ.md](./PSIS_Manager_FAQ.md) — Common questions
- [PSIS_Operations_Checklist.md](./PSIS_Operations_Checklist.md) — Verification checklists

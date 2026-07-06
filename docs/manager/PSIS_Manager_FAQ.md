# PSIS Manager FAQ

Short answers for managers and business stakeholders.

---

## General

### What is PSIS?

**PSIS (Pitch Sequence Intelligence System)** is a web application for baseball pitching coaches. It records pitch sequences and plate-appearance outcomes, then summarizes sessions on a dashboard.

### Who is PSIS for?

Primarily **pitching coaches** and **coaching staff**. Managers oversee availability and adoption; **IT staff** handle installation and maintenance.

### Do I need to understand how PSIS is built?

No. You need to know what it does, how to confirm it is working, and when to call technical support.

---

## Technology

### What is Docker?

Docker is a packaging technology your IT team uses to **install and run PSIS** as a self-contained application. Think of it as a sealed box that contains everything PSIS needs to run.

**Managers:** You do not install Docker yourself unless you are also acting as IT. Ensure someone on your team maintains Docker Desktop or Docker on the host where PSIS runs.

### Do I need GitHub?

**No.** GitHub is used by developers to build PSIS. Published releases are delivered through **Docker Hub**. Managers and coaches never need GitHub access for normal operations.

### Do I need AWS?

**No, not for basic use.** PSIS can run on any computer or server where IT installs Docker — a coaching laptop, a lab PC, or eventually a cloud server. AWS is a future option for larger deployments, not a requirement today.

### What is Docker Hub?

Docker Hub is the online registry where the **official PSIS image** is published:

`taig2k/pitching_sequence_intellegence_system_psis`

Your IT team downloads (pulls) the image from Docker Hub. Managers only need to know that updates come from this published source.

---

## Access and Users

### Can multiple users connect at the same time?

**Yes.** Multiple coaches can open PSIS in their browsers at the same time if they can reach the same PSIS network address.

### Do users need to log in?

**No.** The current release has **no username or password**. Anyone who can open the PSIS web address can use the application.

**Management implication:** Work with IT to control **who can reach the URL** (private network, VPN, or firewall) if access must be restricted.

### Do coaches need software installed?

**No.** Coaches only need a **web browser** and the PSIS address (for example `http://localhost:8080` on the host machine, or your organization's internal URL).

---

## Data

### How is data stored?

PSIS stores coaching data in **JSON files** on the machine where the container runs. There is no separate database server.

### Is data safe if we restart the computer?

**It depends on IT configuration.**

- If IT configured a **persistent data folder** (volume mount), data survives container restarts and updates.
- If not, data could be lost when the container is removed.

**Ask IT:** *"Is PSIS data persisted and backed up?"*

### Can data be backed up?

**Yes.** IT can back up the data folder on a schedule. PSIS does not perform automatic cloud backup by itself.

### What happens to data after an update?

If IT follows the standard update procedure **and** uses a persistent data volume, coaching data should remain after updates.

If data disappears after an update, **escalate to IT immediately** — this indicates a configuration issue.

---

## Operations

### How do I know the system is healthy?

**Quick manager check:**

1. Open your PSIS URL — home page loads
2. Open `http://<your-psis-address>/api/healthz` — you see `{"status":"ok"}`

See the [Operations Checklist](./PSIS_Operations_Checklist.md) for a full routine.

### What URL should we use?

Your IT team assigns this during installation. Common examples:

| Deployment | Example URL |
|------------|-------------|
| Single coaching laptop | `http://localhost:8080` |
| Shared lab PC | `http://<computer-name>:8080` |
| Server on network | `http://<server-address>:8080` |

Confirm the correct address with IT and share it with coaches.

### How often should PSIS be updated?

**Recommendation:** Review monthly with IT. Pull the latest `latest` image when release notes show fixes or features you need. Always update during a planned maintenance window.

### What if PSIS is slow or unresponsive?

1. Ask if others have the same problem
2. Try a browser refresh
3. If widespread, escalate to IT with time and symptoms

---

## Support

### When should I call IT?

- Application will not open
- Health check fails
- Data missing
- Need installation, move, backup, or update

### When should I call the development team?

- IT confirms infrastructure is fine but application behavior is wrong
- Suspected calculation or data logic error
- Approved feature requests

### Where does IT find technical instructions?

[Operator Documentation](../operator/README.md) — not intended for managers, but this is what you hand to technicians.

---

## Limitations

### What does PSIS not do today?

- User login / role-based access
- Multi-team league management
- AI pitching recommendations
- Built-in HTTPS (IT handles security at the network level)
- Automatic off-site backup

See [PSIS_Manager_Guide.md](./PSIS_Manager_Guide.md) for the full limitations list.

---

## More Information

| Topic | Document |
|-------|----------|
| Business overview | [PSIS_Manager_Guide.md](./PSIS_Manager_Guide.md) |
| Daily / weekly / monthly ops | [PSIS_Manager_Runbook.md](./PSIS_Manager_Runbook.md) |
| Verification checklists | [PSIS_Operations_Checklist.md](./PSIS_Operations_Checklist.md) |
| Release version and features | [Release Information](../operator/PSIS_Release_Information.md) |

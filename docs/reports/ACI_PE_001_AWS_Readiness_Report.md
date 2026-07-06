# ACI-PE-001 — PSIS AWS Readiness Report

**Generated:** 2026-07-06 (local assessment)  
**Repository:** https://github.com/the-ai-guy-2k/psis_via_replit.git  
**PA image:** `taig2k/pitching_sequence_intellegence_system_psis:latest`  
**Assessment method:** Public CI evidence, AWS documentation review, local environment probe (no credentials), read-only readiness workflow added for GitHub Actions validation

---

## Executive Summary

| Area | Status |
|------|--------|
| Docker Hub secrets | **Present** (inferred from successful PA publish) |
| AWS GitHub secrets | **Unknown / likely missing** (not listable without `gh` auth locally) |
| AWS identity | **Not verified** (no local or CI AWS run at time of report) |
| App Runner for new PSIS PE | **Not viable** (AWS closed to new customers, Jul 2026) |
| Recommended PE path | **ECS Express Mode + ECR mirror from Docker Hub** |
| **Final status** | **PARTIAL PASS** |

---

## 1. GitHub Secrets Status

Checked via: local `gh secret list` (unavailable — CLI not authenticated), workflow secret-presence probe (added), PA CI indirect validation for Docker Hub.

| Secret | Status | Evidence |
|--------|--------|----------|
| `DOCKERHUB_USERNAME` | **present** | PA workflow run [#7](https://github.com/the-ai-guy-2k/psis_via_replit/actions/runs/28822983314) completed **success** including Docker Hub publish + pull smoke test (`fa29986`) |
| `DOCKERHUB_TOKEN` | **present** | Same as above — `docker/login-action` and `docker push` succeeded |
| `AWS_ACCESS_KEY_ID` | **missing** (probable) | No AWS usage in any workflow; local `aws sts get-caller-identity` → `NoCredentials`; `gh` not authenticated to list secrets |
| `AWS_SECRET_ACCESS_KEY` | **missing** (probable) | Same as above |
| `AWS_REGION` | **missing** (probable) | Not referenced in repository workflows |

**Note:** Secret values were not printed. Re-run validation via **Actions → PSIS PE AWS Readiness → Run workflow** after AWS secrets are configured for authoritative present/missing output.

---

## 2. AWS Identity (`aws sts get-caller-identity`)

| Field | Result |
|-------|--------|
| Account ID | **Not verified** |
| User/Role ARN | **Not verified** |
| Region | **Not verified** (see §3) |

**Local probe:** `aws sts get-caller-identity` failed — `Unable to locate credentials`.

**Next step:** Configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` in GitHub repository secrets, then run `.github/workflows/psis-pe-aws-readiness.yml` (workflow_dispatch).

---

## 3. AWS Region

| Item | Value |
|------|-------|
| Preferred region | `us-east-1` |
| `AWS_REGION` secret | **missing** (probable) |
| Resolved default for PE probes | `us-east-1` (used when secret unset in readiness workflow) |

**Action:** Set `AWS_REGION` to `us-east-1` explicitly in GitHub secrets for operator clarity. Do not change region without approval.

---

## 4. App Runner Readiness

### AWS platform policy (Jul 2026)

Per [AWS App Runner availability change](https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html):

> **AWS App Runner is no longer open to new customers.** Existing customers can continue. AWS recommends **Amazon ECS Express Mode** for new deployments.

**Implication for PSIS:** PSIS PE is a **new** deployment. App Runner is **not the viable target** even if IAM credentials exist.

### Read-only technical checks (not executed — no AWS creds)

| Check | Expected without creds | Notes |
|-------|------------------------|-------|
| `aws apprunner list-services` | Not run | Would confirm API access for existing App Runner accounts only |
| Service-linked role `AWSServiceRoleForAppRunner` | Not run | Required for App Runner operations |
| Docker Hub as direct image source | N/A | Production App Runner deployments typically use **ECR**, not public Docker Hub |

### App Runner readiness verdict

| Verdict | Detail |
|---------|--------|
| **NOT READY for new PSIS PE** | Platform closed to new customers |
| **Architecture docs update recommended** | Physical/Deployment architecture still list App Runner as preferred — should migrate PE target to ECS Express Mode |

---

## 5. IAM Permission Assessment

No AWS identity available — permissions **UNKNOWN** for create/deploy operations.

### Read-only probes (in readiness workflow when creds exist)

| Permission area | Probe | Create-time permission |
|-----------------|-------|------------------------|
| App Runner | `apprunner:ListServices` | `apprunner:CreateService` — **N/A** (not recommended) |
| ECS Express / Fargate | `ecs:ListClusters` | `ecs:CreateExpressGatewayService` — **UNKNOWN** |
| ECR | `ecr:DescribeRepositories` | `ecr:CreateRepository`, `ecr:PutImage` — **UNKNOWN** |
| CloudWatch Logs | `logs:DescribeLogGroups` | `logs:CreateLogGroup` — **UNKNOWN** |
| IAM PassRole | — | `iam:PassRole` for `ecsTaskExecutionRole`, `ecsInfrastructureRoleForExpressServices` — **UNKNOWN** |
| EFS | — | Not required for initial stateless PE; **UNKNOWN** if persistence ACI adds EFS |

**Minimum IAM for recommended PE path (ECS Express + ECR):**

- ECR: push/pull from GitHub Actions
- ECS: create/manage Express Mode service
- IAM: PassRole for ECS task + infrastructure roles
- CloudWatch Logs: write container logs
- (Optional later) EFS mount permissions for JSON data persistence

---

## 6. Deployment Path Options

| Option | Description | Friction | PSIS fit (Jul 2026) |
|--------|-------------|----------|---------------------|
| **A** | App Runner directly from Docker Hub | Low *if* platform allowed | **Blocked** — App Runner closed to new customers; Hub not typical image source |
| **B** | Mirror Hub → **ECR**, deploy **ECS Express Mode** | Medium — extend GHA with ECR push + express deploy action | **Recommended** — AWS official App Runner successor; same container, port 8080, health `GET /api/healthz` |
| **C** | ECS Fargate (full task definition + ALB) | Higher — more IaC, more control | Valid if Express Mode insufficient (custom networking, EFS, multi-service) |

### Recommendation

**Option B — ECS Express Mode with ECR mirror**

1. Keep existing PA pipeline: build, test, publish to Docker Hub (unchanged).
2. Add PE workflow step: pull/tag/push same image to ECR (or build once, push both).
3. Deploy via `aws-actions/amazon-ecs-deploy-express-service` or `aws ecs create-express-gateway-service`.
4. Configure: port `8080`, health check `/api/healthz`, env `PORT=8080`, `NODE_ENV=production`, `BASE_PATH=/`.
5. Plan separate ACI for EFS volume at `/app/artifacts/api-server/data` (JSON persistence).

---

## 7. Known Blockers

1. **AWS GitHub secrets** — not confirmed present; PE cannot deploy from CI until configured.
2. **AWS identity not verified** — `sts get-caller-identity` not executed with repository credentials.
3. **App Runner unavailable for new PSIS PE** — platform policy (2026); conflicts with architecture docs stating App Runner preferred.
4. **No ECR repository** — not created in this ACI (correct); required before PE deploy.
5. **JSON persistence** — stateless PE possible; durable data needs EFS or alternative (future ACI).
6. **Local/CI tooling gap** — `gh` CLI not authenticated on assessment machine; secret list API not queried directly.

---

## 8. Required Operator Actions

| # | Action | Priority |
|---|--------|----------|
| 1 | Add GitHub secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` (`us-east-1`) | **Required** |
| 2 | Run **PSIS PE AWS Readiness** workflow (workflow_dispatch) to verify identity and IAM probes | **Required** |
| 3 | Update architecture PE target from App Runner → **ECS Express Mode** (documentation ACI) | Recommended |
| 4 | Create ECR repository `psis` (or similar) in `us-east-1` — in PE deploy ACI, not this one | Next ACI |
| 5 | Provision IAM user/role with ECR + ECS Express + CloudWatch + PassRole permissions | Required |
| 6 | Consider GitHub OIDC instead of long-lived access keys for PE deploy workflow | Recommended |

---

## 9. Artifacts Added by This ACI

| Artifact | Purpose |
|----------|---------|
| `.github/workflows/psis-pe-aws-readiness.yml` | Read-only workflow_dispatch validation; uploads updated report artifact |
| `docs/reports/ACI_PE_001_AWS_Readiness_Report.md` | This document |

**No App Runner service, ECS service, ECR repository, or other production AWS resources were created.**

---

## 10. Final Status

### **PARTIAL PASS**

| Criterion | Met? |
|-----------|------|
| GitHub secrets status checked | ✓ (Docker Hub confirmed; AWS probable missing) |
| AWS identity verified | ✗ (blocked — no credentials) |
| Region confirmed | ✓ (default `us-east-1`; secret not set) |
| App Runner readiness assessed | ✓ (not viable for new deployment) |
| IAM risk assessed | ✓ (documented as UNKNOWN) |
| Deployment path recommended | ✓ (ECS Express Mode + ECR) |
| Readiness report created | ✓ |

**PASS** for readiness *findings and documentation*; **PARTIAL PASS** overall because AWS credentials are not yet configured and identity is unverified.

After operator configures AWS secrets and a successful readiness workflow run, status may advance to **PASS** for AWS identity while App Runner remains **not recommended**.

---

## References

- PA validation run: https://github.com/the-ai-guy-2k/psis_via_replit/actions/runs/28822983314
- AWS App Runner availability: https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html
- PSIS architecture deployment docs: `docs/architecture/Deployment_Architecture.md`

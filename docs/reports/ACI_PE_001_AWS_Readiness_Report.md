# ACI-PE-001 — PSIS AWS Readiness Report

**Generated:** 2026-07-06  
**Last updated:** 2026-07-06 (ACI-PE-001R recheck)  
**Repository:** https://github.com/the-ai-guy-2k/psis_via_replit.git  
**PA image:** `taig2k/pitching_sequence_intellegence_system_psis:latest`  
**Readiness workflow run:** https://github.com/the-ai-guy-2k/psis_via_replit/actions/runs/28825726947

---

## Executive Summary

| Area | Status |
|------|--------|
| Credential file discovered | **Yes** — `nebula_accessKeys.csv` |
| GitHub AWS secrets configured | **Yes** |
| AWS identity verified | **Yes** |
| Region | **`us-east-1`** |
| ECR / CloudWatch / ECS read probes | **PASS** |
| App Runner for new PSIS PE | **Not viable** (AWS policy + list-services FAIL) |
| Recommended PE path | **ECS Express Mode + ECR mirror** |
| **Final status** | **PASS** |

---

## ACI-PE-001R — Secret Recovery

### Task 1 — Local credential folder

**Path:** `C:\Users\tim\Desktop\stuff`

| File | Role |
|------|------|
| `nebula_accessKeys.csv` | **AWS credentials** (identified) |
| `stuff.txt` | Contains AKIA pattern; duplicate/secondary — not used |
| `openai_key_for_financial_app.txt` | OpenAI key — not AWS |

**Likely credential file:** `nebula_accessKeys.csv`  
**Required values found:** **Yes** — Access key ID and Secret access key columns populated; region not in file → defaulted to `us-east-1`.

Secret values were **not** printed, committed, or copied into the repository.

### Task 2–3 — GitHub secrets

Configured via `gh secret set` (2026-07-06):

| Secret | Status |
|--------|--------|
| `DOCKERHUB_USERNAME` | present |
| `DOCKERHUB_TOKEN` | present |
| `AWS_ACCESS_KEY_ID` | present |
| `AWS_SECRET_ACCESS_KEY` | present |
| `AWS_REGION` | present (`us-east-1`) |

### Task 4 — Workflow committed

| Artifact | Commit |
|----------|--------|
| `.github/workflows/psis-pe-aws-readiness.yml` | `ae778f4` |
| `docs/reports/ACI_PE_001_AWS_Readiness_Report.md` | `ae778f4` |

---

## 1. GitHub Secrets Status (verified in CI)

Validated by **PSIS PE AWS Readiness** workflow — all five required secrets **present**.

---

## 2. AWS Identity (`aws sts get-caller-identity`)

| Field | Value |
|-------|-------|
| Account ID | `526123657916` |
| ARN | `arn:aws:iam::526123657916:user/nebula` |
| Region | `us-east-1` |
| Result | **PASS** |

---

## 3. App Runner Readiness (read-only)

| Check | Result |
|-------|--------|
| `apprunner:ListServices` | **FAIL** |
| Service-linked role `AWSServiceRoleForAppRunner` | unknown_or_missing |

**Policy note:** [AWS App Runner is closed to new customers](https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html) (2026). PSIS PE is a **new** deployment — **do not use App Runner**.

**Verdict:** App Runner **not ready** for PSIS PE (platform policy + API probe failure).

---

## 4. IAM Permission Probes (read-only)

| Capability | Probe | Result |
|------------|-------|--------|
| ECR `describe-repositories` | Read | **PASS** |
| CloudWatch Logs `describe-log-groups` | Read | **PASS** |
| ECS `list-clusters` | Read | **PASS** |
| IAM `get-user` / role read | Read | **UNKNOWN** |
| `iam:PassRole` (ECS Express deploy) | Create-time | **UNKNOWN** |
| `ecs:CreateExpressGatewayService` | Create-time | **UNKNOWN** |
| EFS | Not probed | **UNKNOWN** (future persistence ACI) |

**IAM readiness summary:** Read-only access sufficient for ECR, CloudWatch, and ECS discovery. **Deploy-time permissions unconfirmed** until PE deploy ACI attempts `CreateExpressGatewayService` and ECR push.

---

## 5. ECS Express Readiness

| Criterion | Assessment |
|-----------|------------|
| AWS identity valid | **Yes** |
| ECS API reachable | **Yes** (`list-clusters` PASS) |
| ECR API reachable | **Yes** (`describe-repositories` PASS) |
| CloudWatch Logs reachable | **Yes** |
| ECR repository for PSIS | **Not created** (expected — next ACI) |
| ECS Express service | **Not created** (expected — next ACI) |
| Recommended target | **ECS Express Mode** per AWS App Runner migration guidance |

**ECS Express readiness:** **Ready to proceed** to PE deploy ACI (subject to create-permission validation).

---

## 6. Deployment Path Recommendation

| Option | Verdict |
|--------|---------|
| A — App Runner from Docker Hub | **Blocked** |
| B — Docker Hub → ECR → ECS Express Mode | **Recommended** |
| C — ECS Fargate (full) | Fallback if Express Mode insufficient |

---

## 7. Remaining Blockers

| Blocker | Severity |
|---------|----------|
| App Runner unavailable for new PE | Informational — use ECS Express |
| ECR repository not created | Required in next ACI |
| `iam:PassRole` / ECS Express create not validated | Validate in PE deploy ACI |
| JSON persistence (EFS) not configured | Separate persistence ACI |
| IAM `get-user` probe UNKNOWN | Low — identity verified via STS |

---

## 8. Operator Actions (updated)

| # | Action | Status |
|---|--------|--------|
| 1 | Configure AWS GitHub secrets | **Done** |
| 2 | Run PE AWS Readiness workflow | **Done** — [run 28825726947](https://github.com/the-ai-guy-2k/psis_via_replit/actions/runs/28825726947) |
| 3 | Create ECR repository in `us-east-1` | Next ACI |
| 4 | Extend GHA: ECR push + ECS Express deploy | Next ACI |
| 5 | Confirm `ecsTaskExecutionRole` and `ecsInfrastructureRoleForExpressServices` | Next ACI |
| 6 | Plan EFS mount for `/app/artifacts/api-server/data` | Persistence ACI |

---

## 9. Final Status

### **PASS**

| Criterion | Met |
|-----------|-----|
| AWS credential file identified | ✓ |
| AWS secrets added to GitHub | ✓ |
| Readiness workflow committed and pushed | ✓ |
| Readiness workflow runs successfully | ✓ |
| AWS identity verified | ✓ |
| Region confirmed | ✓ (`us-east-1`) |
| IAM readiness assessed | ✓ (read probes PASS; create UNKNOWN) |
| Report updated | ✓ |

ACI-PE-001 initial **PARTIAL PASS** is resolved for AWS credentials and identity. PE deployment should target **ECS Express Mode + ECR**, not App Runner.

---

## References

- Initial assessment: ACI-PE-001 (2026-07-06 local)
- Recheck workflow: https://github.com/the-ai-guy-2k/psis_via_replit/actions/runs/28825726947
- AWS App Runner availability: https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html
- PA validation: https://github.com/the-ai-guy-2k/psis_via_replit/actions/runs/28822983314

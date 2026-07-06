# ACI-PE-002 — PSIS ECR Mirror & ECS Express Preparation Report

**Generated:** 2026-07-06 22:06:13 UTC
**Workflow run:** https://github.com/the-ai-guy-2k/psis_via_replit/actions/runs/28826468989
**Commit SHA:** `b13f1529577c9b569b20fed48269ac904328be9d`
**AWS account:** `526123657916`
**AWS identity:** `arn:aws:iam::526123657916:user/nebula`
**Region:** `us-east-1`

## Executive Summary

| Item | Value |
|------|-------|
| Repository URI | `526123657916.dkr.ecr.us-east-1.amazonaws.com/pitching_sequence_intellegence_system_psis` |
| Repository created this run | no |
| Image mirrored | PASS |
| Digest verified (Hub = ECR) | PASS |
| ECR pull validation | PASS |
| ECS Express create (simulated) | UNKNOWN |
| **Final status** | **PASS** |

## 1. ECR Repository

| Setting | Value |
|---------|-------|
| Name | `pitching_sequence_intellegence_system_psis` |
| URI | `526123657916.dkr.ecr.us-east-1.amazonaws.com/pitching_sequence_intellegence_system_psis` |
| Status | exists |
| Created this run | no |
| Tag mutability | IMMUTABLE |
| Scan on push | true |
| Encryption | AES256 |

## 2. Image Mirror (Docker Hub → ECR)

| Field | Value |
|-------|-------|
| Source | `taig2k/pitching_sequence_intellegence_system_psis:latest` |
| Hub manifest digest | `sha256:27fc479f69fdf5a10b94ed432747fe266d0f130287fe1bd936351244c2273205` |
| ECR manifest digest | `sha256:72e8f76da32d7aa416bf7d2560cf87e513a5aa8bc89beb35a076f4063d197d88` |
| Image content match (config ID) | PASS |
| Tags pushed | `latest`, `b13f1529577c9b569b20fed48269ac904328be9d` |
| Content verification | PASS |
| Mirror result | PASS |

## 3. ECR Pull Validation

| Check | Result |
|-------|--------|
| Pull from ECR | PASS |
| docker image inspect | PASS |
| ECR digest matches mirror | PASS |
| Layer stack matches Docker Hub | PASS |
| describe-images metadata | PASS |
| Tags in ECR | b13f1529577c9b569b20fed48269ac904328be9d, latest |

## 4. ECS Express Readiness (no service created)

| Check | Result |
|-------|--------|
| ECS list-clusters | PASS |
| ecsTaskExecutionRole | missing |
| ecsInfrastructureRoleForExpressServices | missing |
| iam:PassRole (simulated) | UNKNOWN |
| ecs:CreateExpressGatewayService (simulated) | UNKNOWN |
| ecs:CreateCluster (simulated) | UNKNOWN |

Create-time permissions may remain UNKNOWN if IAM simulate is unavailable or inconclusive.

## 5. Known Blockers

- ECS Express IAM roles may need to be created or granted.
- ECS Express service creation permission not confirmed.
- ECS Express **service not deployed** in this ACI (by design).
- JSON persistence / EFS not configured.

## 6. Recommendations

1. Next ACI: deploy PSIS via ECS Express Mode using `526123657916.dkr.ecr.us-east-1.amazonaws.com/pitching_sequence_intellegence_system_psis:latest`.
2. Health check: `GET /api/healthz`, port `8080`.
3. Ensure `ecsTaskExecutionRole` and `ecsInfrastructureRoleForExpressServices` exist with trust policies.
4. Grant `iam:PassRole` for ECS Express deploy principal.
5. Plan EFS mount for `/app/artifacts/api-server/data` in persistence ACI.

## 7. Pull Commands

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 526123657916.dkr.ecr.us-east-1.amazonaws.com
docker pull 526123657916.dkr.ecr.us-east-1.amazonaws.com/pitching_sequence_intellegence_system_psis:latest
```

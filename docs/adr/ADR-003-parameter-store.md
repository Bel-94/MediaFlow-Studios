# ADR-003: AWS Systems Manager Parameter Store for Configuration

**Date:** 2026-07-21  
**Status:** Accepted  
**Phase:** B — Secure ops baseline

## Context

MediaFlow Studios needs environment-specific configuration (API URL, Cognito IDs, CloudFront domain, bucket/table names) available to CI/CD and applications without committing secrets or environment drift into git.

Options considered:

1. Hardcode values in `environment.ts` / tfvars committed to git  
2. GitHub Actions secrets only  
3. AWS Systems Manager Parameter Store  
4. AWS Secrets Manager for all values  

## Decision

Use **SSM Parameter Store (`String` parameters)** under `/{project}/{environment}/*` for non-secret configuration. Reserve **Secrets Manager** for future true secrets (third-party API keys, DB credentials if introduced).

Terraform publishes parameters after stack apply via `modules/config`.

## Why (business)

- IT and developers share one source of truth per environment.  
- Frontend/CI can refresh config without code changes.  
- Aligns with Well-Architected **Security** (no credential sprawl) and **Operational Excellence** (repeatable config).

## Benefits

- Cheap (standard parameters are free within generous limits)  
- Path-based IAM (`ssm:GetParametersByPath`)  
- Auditable via CloudTrail  
- Works with the existing serverless model  

## Tradeoffs

- Not suitable for high-frequency secret rotation workflows (use Secrets Manager)  
- Application must be granted least-privilege SSM read  
- Local Angular still may use committed public Cognito client IDs (public by design for SPA PKCE)

## Well-Architected mapping

| Pillar | How |
|---|---|
| Security | Config outside app binaries; IAM-scoped reads |
| Cost Optimization | Parameter Store Standard vs Secrets Manager pricing |
| Operational Excellence | Terraform-managed, environment-separated paths |

## Why this was accepted

Portfolio cost target is ~$0–5/month. Parameter Store Standard meets the need without Secrets Manager charges for public/non-secret values.

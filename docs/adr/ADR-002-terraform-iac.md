# ADR-002: Use Terraform for Infrastructure

**Date:** 2024-01-01  
**Status:** Accepted

## Context
Need reproducible, version-controlled AWS infrastructure across dev and prod.

## Decision
Use Terraform with a modules-per-concern layout and per-environment workspaces.

## Consequences
- Consistent environments via `terraform.tfvars`
- Module reuse between dev/prod
- State must be stored remotely (S3 + DynamoDB lock) for team use

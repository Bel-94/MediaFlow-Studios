# ADR-004: Encryption, Block Public Access, and Least-Privilege IAM

**Date:** 2026-07-21  
**Status:** Accepted  
**Phase:** B — Secure ops baseline

## Context

Phase A Checkov/tfsec scans flagged missing encryption, public access controls, and overly broad `s3:*` / `dynamodb:*` IAM policies.

## Decision

1. **S3 SSE-S3 (AES-256)** on media, hosting, and access-log buckets  
2. **S3 Block Public Access** + BucketOwnerEnforced on all buckets  
3. **S3 access logging** for the media bucket; logs expire after 90 days  
4. **Lifecycle rules** abort incomplete multipart uploads and expire noncurrent versions (90 days)  
5. **DynamoDB encryption enabled**; PITR enabled in **prod only**  
6. **SQS managed SSE** on event queue + DLQ  
7. **IAM least privilege** explicit actions for S3, DynamoDB, Logs, SQS, SSM  
8. **Cognito** stronger password policy, optional MFA, token revocation, existence-error prevention  

## Tradeoffs

| Decision | Benefit | Tradeoff | Why accepted |
|---|---|---|---|
| SSE-S3 vs CMK | $0 KMS requests | No customer key rotation | Cost target $0–5/mo |
| PITR prod-only | Lower dev cost | Weaker dev recovery | **Superseded:** PITR now on in all envs (negligible demo cost; satisfies tfsec) |
| No CloudFront WAF | Low cost | No managed edge rules | HTTPS + Cognito + OAC sufficient for portfolio |
| No Lambda VPC | Simple, cheap | No private subnet isolation | No private deps yet |

## Well-Architected

Primarily **Security**, with **Cost Optimization** and **Sustainability** (lifecycle / retention) explicit in the same change set.

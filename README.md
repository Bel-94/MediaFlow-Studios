# MediaFlow Studios — Digital Asset Management Platform

Secure, scalable, serverless DAM on AWS for a fictional media production company. Employees upload, organize, version, and retrieve media assets without managing file servers.

> Portfolio / AWS Community Builders project demonstrating production-grade cloud architecture, DevSecOps, and Well-Architected practices.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Angular (TypeScript) |
| Backend | AWS Lambda (TypeScript, AWS SDK v3) |
| Infrastructure | Terraform |
| CI/CD | GitHub Actions |
| Auth | Amazon Cognito (PKCE) |
| Storage | Amazon S3 (versioned) + DynamoDB |
| Events | EventBridge + SQS (+ DLQ) |
| Observability | CloudWatch logs, metrics, alarms, dashboards |

## Project structure

```
apps/frontend       # Angular SPA
apps/backend        # Lambda functions (TypeScript)
infrastructure/     # Terraform (modules + environments)
docs/               # Architecture, ADRs, runbooks (growing)
scripts/            # Deploy, seed, and developer setup
.github/            # CI workflows + Dependabot
```

## Getting started

### Prerequisites

- Node.js 18+
- Python 3.10+ (for pre-commit)
- Terraform 1.5+
- AWS CLI configured (for deploy)
- Optional locally: [TFLint](https://github.com/terraform-linters/tflint), [terraform-docs](https://terraform-docs.io), [tfsec](https://github.com/aquasecurity/tfsec), [Checkov](https://www.checkov.io/)

### One-time developer setup (Phase A tooling)

```powershell
pwsh ./scripts/setup-dev.ps1
```

This installs pre-commit hooks and app dependencies. After that, every commit runs formatting, Terraform checks, and secret detection automatically.

### Frontend

```bash
cd apps/frontend
npm install
ng serve
```

### Backend

```bash
cd apps/backend
npm install
npm run build
```

### Infrastructure

```bash
cd infrastructure/environments/dev
terraform init
terraform plan
terraform apply
```

## DevSecOps & quality gates (Phase A)

Security and quality issues are detected **before** merge — not after production.

| Tool | When | Purpose |
|---|---|---|
| **pre-commit** | Local commit | fmt, lint, docs inject, hygiene |
| **Gitleaks** | Local + CI | Block secrets from entering git |
| **terraform fmt / validate** | Local + CI | IaC correctness |
| **TFLint** | Local + CI | Terraform best-practice lint |
| **tfsec** | Local + CI | Terraform security scan |
| **Checkov** | Local + CI | Policy-as-code security scan |
| **terraform-docs** | Local + CI | Keep module READMEs in sync |
| **Dependabot** | Weekly PRs | Dependency / Action updates |

### Local commands

```bash
# Run the full pre-commit suite
pre-commit run --all-files

# Terraform format + validate (no remote state)
terraform fmt -recursive infrastructure
terraform -chdir=infrastructure/environments/dev init -backend=false
terraform -chdir=infrastructure/environments/dev validate
```

### CI behavior

On every PR to `main` / `develop`, GitHub Actions runs:

1. Gitleaks (hard fail)
2. Terraform fmt + validate + TFLint (hard fail)
3. tfsec + Checkov (**soft-fail in Phase A** — findings are reported; Phase B remediates then hard-fails)
4. terraform-docs drift check (hard fail if module READMEs are stale)

## Environments

| Environment | Purpose |
|---|---|
| `dev` | Day-to-day integration (currently deployed) |
| `prod` | Portfolio production (manual approval — Phase B release management) |

## Architecture docs

- [Architecture overview](docs/architecture.md)
- [ADRs](docs/adr/) — expanding with Lambda vs EC2, DynamoDB vs RDS, pre-signed URLs, EventBridge, etc.

## Roadmap (platform track)

- **Phase A (this)** — Shift-left: pre-commit, Gitleaks, Checkov, tfsec, CI, Dependabot, terraform-docs
- **Phase B** — Parameter Store, encryption/BPA/IAM hardening, hard-fail security scans, release promotion
- **Phase C** — Structured logs, custom metrics, richer CloudWatch dashboards
- **Phase D** — Runbooks, FinOps, DR plan, expanded ADRs

## License

Portfolio / educational use.

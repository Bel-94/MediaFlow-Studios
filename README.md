# MediaFlow Studios — Digital Asset Management Platform

Secure, scalable, serverless DAM on AWS for a fictional media production company. Employees upload, organize, version, and retrieve media assets without managing file servers.

> Portfolio project demonstrating production-grade cloud architecture, DevSecOps, and Well-Architected practices.

**Repo:** [Bel-94/MediaFlow-Studios](https://github.com/Bel-94/MediaFlow-Studios)

## Stack

| Layer | Technology |
|---|---|
| Frontend | Angular (TypeScript) |
| Backend | AWS Lambda (TypeScript, AWS SDK v3) |
| Infrastructure | Terraform |
| CI/CD | GitHub Actions (CI + env promotion) |
| Auth | Amazon Cognito (PKCE, optional MFA) |
| Storage | Amazon S3 (versioned, encrypted) + DynamoDB |
| Config | SSM Parameter Store |
| Events | EventBridge + SQS (+ DLQ, SSE) |
| Observability | CloudWatch logs, metrics, alarms, dashboards |

## Project structure

```
apps/frontend       # Angular SPA
apps/backend        # Lambda functions (TypeScript)
infrastructure/     # Terraform (modules + environments)
docs/               # Architecture, ADRs, release management
scripts/            # Deploy, seed, SSM sync, developer setup
.github/            # CI + deploy-dev + deploy-prod + Dependabot
```

## Getting started

### Prerequisites

- Node.js 18+
- Python 3.10+ (for pre-commit)
- Terraform 1.5+
- AWS CLI configured (for deploy)
- Optional locally: [TFLint](https://github.com/terraform-linters/tflint), [terraform-docs](https://terraform-docs.io), [tfsec](https://github.com/aquasecurity/tfsec), [Checkov](https://www.checkov.io/)

### One-time developer setup

```powershell
.\scripts\setup-dev.ps1
```

### Frontend

```bash
cd apps/frontend
npm install
ng serve
```

Sync env from Parameter Store after Terraform apply:

```powershell
.\scripts\sync-frontend-env.ps1 -Env dev
```

### Backend

```bash
cd apps/backend
npm install
npm run build
.\scripts\deploy-functions.ps1 -Env dev
```

### Infrastructure

```bash
cd infrastructure/environments/dev
terraform init
terraform plan
terraform apply
```

## DevSecOps & quality gates

Security and quality issues are detected **before** merge — not after production.

| Tool | When | Purpose |
|---|---|---|
| **pre-commit** | Local commit | fmt, lint, docs inject, hygiene |
| **Gitleaks** | Local + CI | Block secrets from entering git |
| **terraform fmt / validate** | Local + CI | IaC correctness |
| **TFLint** | Local + CI | Terraform best-practice lint |
| **tfsec** | Local + CI | Terraform security scan (**hard fail**) |
| **Checkov** | Local + CI | Policy-as-code security scan (**hard fail**) |
| **terraform-docs** | Local + CI | Keep module READMEs in sync |
| **Dependabot** | Weekly PRs | Dependency / Action updates |
| **SSM Parameter Store** | Runtime / CI | Non-secret config outside git |

### CI / CD promotion

```
PR → CI (hard fail) → merge main → Deploy Development
                                      ↓ (manual)
                               Deploy Production
```

See [docs/release-management.md](docs/release-management.md) for GitHub Environment secrets setup.

## Environments

| Environment | Purpose |
|---|---|
| `dev` | Day-to-day integration |
| `prod` | Portfolio production (manual approval) |

## Architecture docs

- [Architecture overview](docs/architecture.md)
- [Release management](docs/release-management.md)
- [ADRs](docs/adr/) — including Parameter Store and security hardening

## Roadmap (platform track)

- [x] **Phase A** — Shift-left: pre-commit, Gitleaks, Checkov, tfsec, CI, Dependabot, terraform-docs
- [x] **Phase B** — Parameter Store, encryption/BPA/IAM hardening, hard-fail scans, release promotion
- [ ] **Phase C** — Structured logs, custom metrics, richer CloudWatch dashboards
- [ ] **Phase D** — Runbooks, FinOps, DR plan, expanded ADRs

## License

Portfolio / educational use.

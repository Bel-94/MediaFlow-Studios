# GitHub Environments & Release Promotion

MediaFlow uses enterprise-style promotion even for a portfolio project:

```
Feature branch → Pull Request → CI (hard fail)
        ↓ merge
      main
        ↓
 Deploy — Development (auto, environment: development)
        ↓ manual
 Deploy — Production (workflow_dispatch + environment: production approval)
```

## One-time GitHub setup

1. Repo → **Settings → Environments**
2. Create **`development`**
   - Add secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   - IAM user/role should allow Terraform + Lambda update on the `s3files-*-dev` stack only (least privilege)
3. Create **`production`**
   - Enable **Required reviewers**
   - Add the same secret names (preferably a separate prod IAM principal)
4. Ensure Actions are enabled

## Local apply (until CI secrets are configured)

```powershell
cd infrastructure/environments/dev
terraform init
terraform plan
terraform apply

# Then ship Lambda code (fixes placeholder / missing index)
..\..\..\scripts\deploy-functions.ps1 -Env dev
```

## Fetch config from Parameter Store

After apply, non-secret config lives under `/s3files/dev/*`:

```powershell
aws ssm get-parameters-by-path --path /s3files/dev --recursive --region us-east-1
```

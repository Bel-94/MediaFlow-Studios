# Deploy Angular SPA to S3 + invalidate CloudFront
# Usage (from repo root):
#   .\scripts\deploy-frontend.ps1 -Env dev
#   .\scripts\deploy-frontend.ps1 -Env dev -SkipSync
#
# Note: on Windows PowerShell, prefer this script over raw terraform -target=module...
# (dots in -target values are misparsed unless quoted).

param(
  [ValidateSet("dev", "prod")]
  [string]$Env = "dev",
  [string]$Project = "s3files",
  [string]$Region = "us-east-1",
  [switch]$SkipSync,
  [switch]$SkipNpmCi
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

if (-not $SkipSync) {
  Write-Host "==> Syncing environment.prod.ts from SSM..." -ForegroundColor Cyan
  & "$PSScriptRoot\sync-frontend-env.ps1" -Env $Env -Project $Project -Region $Region -ProductionFile
}

Write-Host "==> Building Angular production bundle..." -ForegroundColor Cyan
Push-Location "$Root\apps\frontend"
if (-not $SkipNpmCi) {
  npm install
}
npm run build:prod
Pop-Location

$distCandidates = @(
  "$Root\apps\frontend\dist\frontend\browser",
  "$Root\apps\frontend\dist\frontend"
)
$Dist = $distCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $Dist) { throw "Build output not found under apps/frontend/dist" }

$Bucket = "$Project-frontend-$Env"
Write-Host "==> Syncing $Dist -> s3://$Bucket/" -ForegroundColor Cyan
aws s3 sync $Dist "s3://$Bucket/" --delete --region $Region

Write-Host "==> Resolving CloudFront distribution..." -ForegroundColor Cyan
$DistId = aws cloudfront list-distributions `
  --query "DistributionList.Items[?Origins.Items[0].DomainName=='$Bucket.s3.$Region.amazonaws.com' || Origins.Items[0].DomainName=='$Bucket.s3.amazonaws.com'].Id | [0]" `
  --output text

if (-not $DistId -or $DistId -eq "None") {
  # Fallback: match comment / alias via SSM cloudfront domain
  $CfDomain = aws ssm get-parameter `
    --name "/$Project/$Env/cloudfront_domain" `
    --region $Region `
    --query "Parameter.Value" `
    --output text
  $DistId = aws cloudfront list-distributions `
    --query "DistributionList.Items[?DomainName=='$CfDomain'].Id | [0]" `
    --output text
}

if (-not $DistId -or $DistId -eq "None") {
  throw "Could not resolve CloudFront distribution ID for $Env"
}

Write-Host "==> Invalidating CloudFront $DistId ..." -ForegroundColor Cyan
aws cloudfront create-invalidation --distribution-id $DistId --paths "/*" --region $Region | Out-Null

$Domain = aws cloudfront get-distribution --id $DistId --query "Distribution.DomainName" --output text
Write-Host "==> Deployed: https://$Domain" -ForegroundColor Green

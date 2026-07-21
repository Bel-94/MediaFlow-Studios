# Sync frontend environment values from SSM Parameter Store
# Usage:
#   pwsh ./scripts/sync-frontend-env.ps1 -Env dev
#   pwsh ./scripts/sync-frontend-env.ps1 -Env dev -ProductionFile

param(
  [ValidateSet("dev", "prod")]
  [string]$Env = "dev",
  [string]$Project = "s3files",
  [string]$Region = "us-east-1",
  [switch]$ProductionFile
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$Path = "/$Project/$Env"

Write-Host "==> Reading SSM parameters under $Path ..." -ForegroundColor Cyan
$params = aws ssm get-parameters-by-path `
  --path $Path `
  --recursive `
  --region $Region `
  --query "Parameters" `
  --output json | ConvertFrom-Json

if (-not $params) { throw "No parameters found at $Path. Apply Terraform first." }

$map = @{}
foreach ($p in $params) {
  $key = $p.Name.Split("/")[-1]
  $map[$key] = $p.Value
}

$required = @("api_url", "cognito_user_pool_id", "cognito_client_id", "cognito_domain", "cloudfront_domain")
foreach ($r in $required) {
  if (-not $map.ContainsKey($r)) { throw "Missing SSM parameter: $r" }
}

$redirectUri = if ($ProductionFile) {
  "https://$($map.cloudfront_domain)/callback"
} else {
  "http://localhost:4200/callback"
}

$isProd = if ($ProductionFile) { "true" } else { "false" }
$outFile = if ($ProductionFile) {
  "$Root\apps\frontend\src\environments\environment.prod.ts"
} else {
  "$Root\apps\frontend\src\environments\environment.ts"
}

$content = @"
export const environment = {
  production: $isProd,
  apiUrl: '$($map.api_url)',
  cognitoUserPoolId: '$($map.cognito_user_pool_id)',
  cognitoClientId: '$($map.cognito_client_id)',
  cognitoDomain: '$($map.cognito_domain)',
  redirectUri: '$redirectUri',
};
"@

Set-Content -Path $outFile -Value $content -Encoding utf8
Write-Host "==> Wrote $outFile" -ForegroundColor Green

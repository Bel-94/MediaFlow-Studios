# deploy.ps1 — builds and deploys all Lambda functions
param(
  [string]$Env    = "dev",
  [string]$Region = "us-east-1",
  [string]$Project = "s3files"
)

$ErrorActionPreference = "Stop"
$BackendDir = "$PSScriptRoot\..\apps\backend"
$FunctionsDir = "$BackendDir\functions"
$DistDir = "$BackendDir\dist"

# ── Step 1: Build all TypeScript ───────────────────────────────────────────────
Write-Host "==> Building backend TypeScript..." -ForegroundColor Cyan
Push-Location $BackendDir
npm run build
Pop-Location

# ── Step 2: Package and deploy each function ───────────────────────────────────
$functions = @{
  "files-api"           = "functions/files-api/index.js"
  "versions-api"        = "functions/versions-api/index.js"
  "s3-event-processor"  = "functions/s3-event-processor/index.js"
  "analytics-api"       = "functions/analytics-api/index.js"
}

foreach ($fn in $functions.Keys) {
  $handlerFile = $functions[$fn]
  $zipPath = "$DistDir\$fn.zip"
  $fnName  = "$Project-$fn-$Env"

  Write-Host "==> Packaging $fn..." -ForegroundColor Cyan

  # Create zip with handler + shared + node_modules
  if (Test-Path $zipPath) { Remove-Item $zipPath }

  $tempDir = "$DistDir\tmp-$fn"
  if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
  New-Item -ItemType Directory -Path $tempDir | Out-Null

  # Copy compiled output
  Copy-Item -Recurse "$DistDir\functions" "$tempDir\functions"
  Copy-Item -Recurse "$DistDir\shared"    "$tempDir\shared"

  # Copy node_modules (production only)
  Copy-Item -Recurse "$BackendDir\node_modules" "$tempDir\node_modules"

  # Zip it
  Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath
  Remove-Item -Recurse -Force $tempDir

  # Deploy to Lambda
  Write-Host "==> Deploying $fnName..." -ForegroundColor Cyan
  aws lambda update-function-code `
    --function-name $fnName `
    --zip-file "fileb://$zipPath" `
    --region $Region | Out-Null

  Write-Host "  ✓ $fnName deployed" -ForegroundColor Green
}

Write-Host "`n==> All functions deployed successfully!" -ForegroundColor Green

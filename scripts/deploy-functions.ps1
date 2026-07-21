param(
  [string]$Env = "dev",
  [string]$Region = "us-east-1",
  [string]$Project = "s3files"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$BackendDir = "$Root\apps\backend"
$DistDir = "$BackendDir\dist"

Write-Host "==> Building backend..." -ForegroundColor Cyan
Push-Location $BackendDir
npm run build
if ($LASTEXITCODE -ne 0) { throw "Backend build failed" }
Pop-Location

$Functions = @("files-api", "versions-api", "s3-event-processor", "analytics-api")
$ZipPath = "$env:TEMP\mediaflow-backend.zip"
$TempDir = "$env:TEMP\mediaflow-backend-pkg"

if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
New-Item -ItemType Directory -Path $TempDir | Out-Null

Copy-Item "$DistDir\*" $TempDir -Recurse -Force
Copy-Item "$BackendDir\node_modules" "$TempDir\node_modules" -Recurse -Force
Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipPath -Force
Remove-Item $TempDir -Recurse -Force

foreach ($fn in $Functions) {
  $FnName = "$Project-$fn-$Env"
  $Handler = "functions/$fn/index.handler"

  Write-Host "==> Deploying $FnName ($Handler)..." -ForegroundColor Cyan

  aws lambda update-function-code `
    --function-name $FnName `
    --zip-file "fileb://$ZipPath" `
    --region $Region | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "update-function-code failed for $FnName" }

  # Wait until the previous update finishes before changing configuration
  aws lambda wait function-updated --function-name $FnName --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Timed out waiting for $FnName code update" }

  aws lambda update-function-configuration `
    --function-name $FnName `
    --handler $Handler `
    --region $Region | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "update-function-configuration failed for $FnName" }

  aws lambda wait function-updated --function-name $FnName --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Timed out waiting for $FnName config update" }

  Write-Host "  OK $FnName deployed" -ForegroundColor Green
}

Write-Host "==> All functions deployed." -ForegroundColor Green

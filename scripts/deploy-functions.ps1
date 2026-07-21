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
Pop-Location

$Functions = @("files-api", "versions-api", "s3-event-processor", "analytics-api")

foreach ($fn in $Functions) {
  $FnName = "$Project-$fn-$Env"
  $ZipPath = "$env:TEMP\$fn.zip"
  $TempDir = "$env:TEMP\$fn-pkg"

  Write-Host "==> Packaging $fn..." -ForegroundColor Cyan

  if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
  if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
  New-Item -ItemType Directory -Path $TempDir | Out-Null

  Copy-Item "$DistDir\*" $TempDir -Recurse -Force
  Copy-Item "$BackendDir\node_modules" "$TempDir\node_modules" -Recurse -Force

  Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipPath -Force
  Remove-Item $TempDir -Recurse -Force

  Write-Host "==> Deploying $FnName..." -ForegroundColor Cyan
  aws lambda update-function-code `
    --function-name $FnName `
    --zip-file "fileb://$ZipPath" `
    --region $Region | Out-Null

  Write-Host "  OK $FnName deployed" -ForegroundColor Green
}

Write-Host "==> All functions deployed." -ForegroundColor Green

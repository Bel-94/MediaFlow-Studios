# MediaFlow Studios - Developer setup (Phase A tooling)
# Run from repo root (s3-files-workspace):
#   .\scripts\setup-dev.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "==> MediaFlow Studios - Phase A developer setup" -ForegroundColor Cyan

function Assert-Command($Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $Name"
  }
}

Write-Host "`n[1/5] Checking prerequisites..."
Assert-Command python
Assert-Command pip
Assert-Command terraform
Assert-Command node
Assert-Command npm

Write-Host "`n[2/5] Installing pre-commit..."
pip install --user pre-commit | Out-Null
pre-commit install
try {
  pre-commit install --hook-type commit-msg
} catch {
  Write-Host "  commit-msg hook skipped (optional)" -ForegroundColor Yellow
}

Write-Host "`n[3/5] Installing TFLint AWS plugin (if tflint present)..."
if (Get-Command tflint -ErrorAction SilentlyContinue) {
  tflint --init --config "$Root\.tflint.hcl"
} else {
  Write-Host "  tflint not found - install from https://github.com/terraform-linters/tflint (optional locally; CI runs it)" -ForegroundColor Yellow
}

Write-Host "`n[4/5] Installing terraform-docs (if present)..."
if (Get-Command terraform-docs -ErrorAction SilentlyContinue) {
  Write-Host "  terraform-docs OK"
} else {
  Write-Host "  terraform-docs not found - install from https://terraform-docs.io (optional locally; CI + pre-commit run it)" -ForegroundColor Yellow
}

Write-Host "`n[5/5] Installing app dependencies..."
Push-Location apps\frontend; npm install; Pop-Location
Push-Location apps\backend; npm install; Pop-Location

Write-Host "`nDone. Useful commands:" -ForegroundColor Green
Write-Host "  pre-commit run --all-files"
Write-Host "  terraform fmt -recursive infrastructure"
Write-Host "  terraform -chdir=infrastructure/environments/dev init -backend=false"
Write-Host "  terraform -chdir=infrastructure/environments/dev validate"

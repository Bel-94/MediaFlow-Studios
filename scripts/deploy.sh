#!/bin/bash
set -e

ENV=${1:-dev}
REGION=${2:-us-east-1}
PROJECT="s3files"

echo "==> Building Lambda functions..."
for fn in files-api versions-api s3-event-processor analytics-api; do
  FN_DIR="apps/backend/functions/$fn"
  if [ -f "$FN_DIR/package.json" ]; then
    (cd "$FN_DIR" && npm ci && npm run build)
  fi
done

echo "==> Deploying infrastructure ($ENV)..."
cd infrastructure/environments/$ENV
terraform init -input=false
terraform apply -auto-approve -var="environment=$ENV" -var="aws_region=$REGION" -var="project_name=$PROJECT"

echo "==> Done."

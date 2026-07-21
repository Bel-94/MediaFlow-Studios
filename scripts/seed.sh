#!/bin/bash
set -e

ENV=${1:-dev}
BUCKET="${PROJECT:-s3files}-files-$ENV"

echo "==> Seeding S3 bucket: $BUCKET"

# Upload sample files
for i in 1 2 3; do
  echo "Sample file $i" > "/tmp/sample-$i.txt"
  aws s3 cp "/tmp/sample-$i.txt" "s3://$BUCKET/uploads/sample-$i.txt"
  echo "  Uploaded sample-$i.txt"
done

echo "==> Seed complete."

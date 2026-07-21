# Module: Storage

Versioned S3 bucket for media assets and DynamoDB table for asset metadata / indexing (system of record split: objects in S3, metadata in DynamoDB).

Includes Block Public Access, SSE-S3 encryption, access logging, and lifecycle rules.

<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

| Name | Version |
|------|---------|
| aws | n/a |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| allowed_origins | CORS allowed origins for browser-to-S3 uploads | `list(string)` | n/a | yes |
| environment | Deployment environment (dev, prod) | `string` | n/a | yes |
| project_name | Project name prefix for all resources | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| access_logs_bucket_name | S3 access logs bucket name |
| bucket_arn | Media assets S3 bucket ARN |
| bucket_name | Media assets S3 bucket name |
| table_arn | DynamoDB metadata table ARN |
| table_name | DynamoDB metadata table name |
<!-- END_TF_DOCS -->

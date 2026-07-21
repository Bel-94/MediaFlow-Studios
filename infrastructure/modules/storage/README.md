# Module: Storage

Versioned S3 bucket for media assets and DynamoDB table for asset metadata / indexing (system of record split: objects in S3, metadata in DynamoDB).

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
| allowed_origins | n/a | `list(string)` | n/a | yes |
| environment | n/a | `string` | n/a | yes |
| project_name | n/a | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| bucket_arn | n/a |
| bucket_name | n/a |
| table_arn | n/a |
| table_name | n/a |
<!-- END_TF_DOCS -->

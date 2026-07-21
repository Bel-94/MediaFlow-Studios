# Module: Compute

AWS Lambda functions for files API, versions API, analytics API, and the S3 event processor, plus IAM execution roles.

<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

| Name | Version |
|------|---------|
| aws | n/a |
| archive | n/a |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| bucket_arn | n/a | `string` | n/a | yes |
| bucket_name | n/a | `string` | n/a | yes |
| environment | n/a | `string` | n/a | yes |
| project_name | n/a | `string` | n/a | yes |
| queue_arn | n/a | `string` | n/a | yes |
| table_arn | n/a | `string` | n/a | yes |
| table_name | n/a | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| function_arns | n/a |
| function_names | n/a |
| s3_event_processor_arn | n/a |
| s3_event_processor_name | n/a |
<!-- END_TF_DOCS -->

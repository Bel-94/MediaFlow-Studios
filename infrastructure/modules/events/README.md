# Module: Events

EventBridge rules for S3 object events, SQS queue for reliable delivery, and a dead-letter queue for failed processing.

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
| bucket_arn | n/a | `string` | n/a | yes |
| environment | n/a | `string` | n/a | yes |
| project_name | n/a | `string` | n/a | yes |
| s3_event_processor_arn | n/a | `string` | n/a | yes |
| s3_event_processor_name | n/a | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| dlq_arn | n/a |
| dlq_name | n/a |
| queue_arn | n/a |
| queue_url | n/a |
<!-- END_TF_DOCS -->

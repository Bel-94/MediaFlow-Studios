# Module: Observability

CloudWatch alarms, SNS email alerts, and an operational dashboard for Lambda health and DLQ depth.

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
| alert_email | n/a | `string` | n/a | yes |
| aws_region | n/a | `string` | n/a | yes |
| dlq_arn | n/a | `string` | n/a | yes |
| dlq_name | n/a | `string` | n/a | yes |
| environment | n/a | `string` | n/a | yes |
| function_names | n/a | `map(string)` | n/a | yes |
| project_name | n/a | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| sns_topic_arn | n/a |
<!-- END_TF_DOCS -->

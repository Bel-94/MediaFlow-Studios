# Module: Observability

CloudWatch alarms, SNS email alerts, and an operational dashboard covering Lambda health,
API Gateway latency, DLQ depth, and MediaFlow business metrics (`MediaFlow/DAM` via EMF).

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
| alert_email | Email for SNS alarm notifications | `string` | n/a | yes |
| api_name | API Gateway REST API name | `string` | n/a | yes |
| api_stage | API Gateway stage name | `string` | n/a | yes |
| aws_region | AWS region for dashboard widgets | `string` | n/a | yes |
| dlq_arn | Dead-letter queue ARN | `string` | n/a | yes |
| dlq_name | Dead-letter queue name for metrics dimensions | `string` | n/a | yes |
| environment | Deployment environment | `string` | n/a | yes |
| function_names | Map of logical function key to Lambda function name | `map(string)` | n/a | yes |
| project_name | Project name prefix | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| sns_topic_arn | n/a |
<!-- END_TF_DOCS -->

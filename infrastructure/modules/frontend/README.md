# Module: Frontend

S3 static hosting bucket (private) and CloudFront distribution with Origin Access Control for the Angular SPA.

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
| environment | n/a | `string` | n/a | yes |
| project_name | n/a | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| cloudfront_domain | n/a |
| cloudfront_id | n/a |
| hosting_bucket | n/a |
<!-- END_TF_DOCS -->

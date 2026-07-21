# Module: Auth

Amazon Cognito user pool, app client, and hosted UI domain for MediaFlow employee authentication (OAuth 2.0 + PKCE).

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
| callback_urls | Allowed redirect URIs after login | `list(string)` | n/a | yes |
| environment | n/a | `string` | n/a | yes |
| logout_urls | Allowed redirect URIs after logout | `list(string)` | n/a | yes |
| project_name | n/a | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| client_id | n/a |
| cognito_domain | n/a |
| user_pool_arn | n/a |
| user_pool_id | n/a |
<!-- END_TF_DOCS -->

# Module: API

API Gateway (REST) with Cognito JWT authorizer. Routes upload, list, delete, versions, and analytics to Lambda integrations.

<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

| Name | Version |
|------|---------|
| aws | n/a |

## Resources

| Name | Type |
|------|------|
| [aws_api_gateway_authorizer.cognito](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_authorizer) | resource |
| [aws_api_gateway_deployment.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_deployment) | resource |
| [aws_api_gateway_rest_api.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_rest_api) | resource |
| [aws_api_gateway_stage.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_stage) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| allowed_origins | n/a | `list(string)` | n/a | yes |
| aws_region | n/a | `string` | n/a | yes |
| environment | n/a | `string` | n/a | yes |
| function_arns | n/a | `map(string)` | n/a | yes |
| function_names | n/a | `map(string)` | n/a | yes |
| project_name | n/a | `string` | n/a | yes |
| user_pool_arn | n/a | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| api_url | n/a |
| rest_api_id | n/a |
<!-- END_TF_DOCS -->

# Module: Config

Publishes non-secret application configuration to AWS Systems Manager Parameter Store
under `/{project}/{environment}/*` for CI builds and runtime lookups.

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
| environment | Deployment environment (dev, prod) | `string` | n/a | yes |
| parameters | Key/value map of non-secret configuration values | `map(string)` | n/a | yes |
| project_name | Project name prefix | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| parameter_arns | ARNs of published SSM parameters |
| parameter_names | Full SSM parameter names |
| parameter_path | SSM parameter path prefix for this environment |
<!-- END_TF_DOCS -->

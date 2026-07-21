# Secure configuration management via AWS Systems Manager Parameter Store.
# Business value: runtime/build config is not hardcoded in git; CI and apps read
# Standard parameters by path. Secrets Manager is reserved for future credentials.

variable "project_name" {
  type        = string
  description = "Project name prefix"
}

variable "environment" {
  type        = string
  description = "Deployment environment (dev, prod)"
}

variable "parameters" {
  type        = map(string)
  description = "Key/value map of non-secret configuration values to publish under /{project}/{env}/"
}

locals {
  prefix = "/${var.project_name}/${var.environment}"
}

resource "aws_ssm_parameter" "config" {
  for_each = var.parameters

  name        = "${local.prefix}/${each.key}"
  description = "MediaFlow ${var.environment} config: ${each.key}"
  type        = "String"
  value       = each.value

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

output "parameter_path" {
  description = "SSM parameter path prefix for this environment"
  value       = local.prefix
}

output "parameter_arns" {
  description = "ARNs of published SSM parameters"
  value       = { for k, v in aws_ssm_parameter.config : k => v.arn }
}

output "parameter_names" {
  description = "Full SSM parameter names"
  value       = { for k, v in aws_ssm_parameter.config : k => v.name }
}

variable "project_name" {
  type        = string
  description = "Project name prefix"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "aws_region" {
  type        = string
  description = "AWS region for dashboard widgets"
}

variable "function_names" {
  type        = map(string)
  description = "Map of logical function key to Lambda function name"
}

variable "dlq_arn" {
  type        = string
  description = "Dead-letter queue ARN"
}

variable "dlq_name" {
  type        = string
  description = "Dead-letter queue name for metrics dimensions"
}

variable "alert_email" {
  type        = string
  description = "Email for SNS alarm notifications"
}

variable "api_name" {
  type        = string
  description = "API Gateway REST API name (ApiName dimension)"
}

variable "api_stage" {
  type        = string
  description = "API Gateway stage name"
}

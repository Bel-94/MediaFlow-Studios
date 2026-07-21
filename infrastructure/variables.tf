variable "project_name" {
  type        = string
  description = "Project name prefix for all resources"
}

variable "environment" {
  type        = string
  description = "Deployment environment (dev, prod)"
  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment must be dev or prod"
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "alert_email" {
  type        = string
  description = "Email address to receive CloudWatch alarm notifications"
}

variable "callback_urls" {
  type        = list(string)
  description = "Cognito allowed callback URLs"
}

variable "logout_urls" {
  type        = list(string)
  description = "Cognito allowed logout URLs"
}

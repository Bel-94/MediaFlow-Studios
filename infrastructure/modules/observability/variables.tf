variable "project_name" { type = string }
variable "environment" { type = string }
variable "aws_region" { type = string }
variable "function_names" { type = map(string) }
variable "dlq_arn" { type = string }
variable "dlq_name" { type = string }
variable "alert_email" { type = string }

variable "project_name" { type = string }
variable "environment" { type = string }
variable "aws_region" { type = string }
variable "user_pool_arn" { type = string }
variable "function_arns" { type = map(string) }
variable "function_names" { type = map(string) }
variable "allowed_origins" { type = list(string) }

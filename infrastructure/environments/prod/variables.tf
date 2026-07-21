variable "project_name" { type = string }
variable "aws_region" { type = string }
variable "alert_email" { type = string }
variable "callback_urls" { type = list(string) }
variable "logout_urls" { type = list(string) }

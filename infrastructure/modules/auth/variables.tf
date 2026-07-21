variable "project_name" { type = string }
variable "environment" { type = string }

variable "callback_urls" {
  type        = list(string)
  description = "Allowed redirect URIs after login"
}

variable "logout_urls" {
  type        = list(string)
  description = "Allowed redirect URIs after logout"
}

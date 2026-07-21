variable "project_name" {
  type        = string
  description = "Project name prefix for all resources"
}

variable "environment" {
  type        = string
  description = "Deployment environment (dev, prod)"
}

variable "allowed_origins" {
  type        = list(string)
  description = "CORS allowed origins for browser-to-S3 uploads (CloudFront / localhost)"
}

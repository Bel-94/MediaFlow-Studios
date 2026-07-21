variable "project_name" {
  type        = string
  description = "Project name prefix"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "s3_event_processor_arn" {
  type        = string
  description = "ARN of the S3 event processor Lambda"
}

variable "s3_event_processor_name" {
  type        = string
  description = "Name of the S3 event processor Lambda"
}

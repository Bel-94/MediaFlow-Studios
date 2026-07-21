output "api_url" {
  description = "API Gateway invoke URL"
  value       = module.api.api_url
}

output "user_pool_id" {
  description = "Cognito user pool ID"
  value       = module.auth.user_pool_id
}

output "cognito_client_id" {
  description = "Cognito app client ID (public — embedded in SPA)"
  value       = module.auth.client_id
}

output "cognito_domain" {
  description = "Cognito hosted UI domain"
  value       = module.auth.cognito_domain
}

output "bucket_name" {
  description = "Media assets S3 bucket"
  value       = module.storage.bucket_name
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain for the Angular SPA"
  value       = module.frontend.cloudfront_domain
}

output "ssm_parameter_path" {
  description = "SSM Parameter Store path prefix for this environment"
  value       = module.config.parameter_path
}

output "api_url" { value = module.api.api_url }
output "user_pool_id" { value = module.auth.user_pool_id }
output "cognito_client_id" { value = module.auth.client_id }
output "cognito_domain" { value = module.auth.cognito_domain }
output "bucket_name" { value = module.storage.bucket_name }
output "cloudfront_domain" { value = module.frontend.cloudfront_domain }

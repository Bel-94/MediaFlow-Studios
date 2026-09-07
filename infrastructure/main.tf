terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.63"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
  required_version = ">= 1.10"
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
    }
  }
}

module "auth" {
  source        = "./modules/auth"
  project_name  = var.project_name
  environment   = var.environment
  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls
}

module "storage" {
  source          = "./modules/storage"
  project_name    = var.project_name
  environment     = var.environment
  allowed_origins = var.logout_urls
}

module "compute" {
  source       = "./modules/compute"
  project_name = var.project_name
  environment  = var.environment
  bucket_arn   = module.storage.bucket_arn
  table_arn    = module.storage.table_arn
  bucket_name  = module.storage.bucket_name
  table_name   = module.storage.table_name
  queue_arn    = module.events.queue_arn
}

module "events" {
  source                  = "./modules/events"
  project_name            = var.project_name
  environment             = var.environment
  s3_event_processor_arn  = module.compute.s3_event_processor_arn
  s3_event_processor_name = module.compute.s3_event_processor_name
}

module "api" {
  source          = "./modules/api"
  project_name    = var.project_name
  environment     = var.environment
  aws_region      = var.aws_region
  user_pool_arn   = module.auth.user_pool_arn
  function_arns   = module.compute.function_arns
  function_names  = module.compute.function_names
  allowed_origins = var.logout_urls
}

module "frontend" {
  source       = "./modules/frontend"
  project_name = var.project_name
  environment  = var.environment
}

module "observability" {
  source         = "./modules/observability"
  project_name   = var.project_name
  environment    = var.environment
  aws_region     = var.aws_region
  function_names = module.compute.function_names
  dlq_name       = module.events.dlq_name
  alert_email    = var.alert_email
  api_name       = "${var.project_name}-${var.environment}"
  api_stage      = var.environment
}

# Non-secret config for CI / apps — never commit rotating secrets to git
module "config" {
  source       = "./modules/config"
  project_name = var.project_name
  environment  = var.environment
  parameters = {
    api_url              = module.api.api_url
    cognito_user_pool_id = module.auth.user_pool_id
    cognito_client_id    = module.auth.client_id
    cognito_domain       = module.auth.cognito_domain
    cloudfront_domain    = module.frontend.cloudfront_domain
    bucket_name          = module.storage.bucket_name
    table_name           = module.storage.table_name
  }
}

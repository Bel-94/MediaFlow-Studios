terraform {
  backend "s3" {
    bucket       = "s3files-tf-state-806162193320"
    key          = "prod/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}

module "s3_files" {
  source        = "../../"
  project_name  = var.project_name
  environment   = "prod"
  aws_region    = var.aws_region
  alert_email   = var.alert_email
  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls
}

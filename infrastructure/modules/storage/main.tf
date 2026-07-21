resource "aws_s3_bucket" "files" {
  bucket = "${var.project_name}-files-${var.environment}"
}

resource "aws_s3_bucket_versioning" "files" {
  bucket = aws_s3_bucket.files.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_cors_configuration" "files" {
  bucket = aws_s3_bucket.files.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag", "x-amz-version-id"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_notification" "files" {
  bucket      = aws_s3_bucket.files.id
  eventbridge = true
}

resource "aws_dynamodb_table" "files" {
  name         = "${var.project_name}-files-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "workspaceId"
  range_key    = "filePath"

  attribute {
    name = "workspaceId"
    type = "S"
  }

  attribute {
    name = "filePath"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "workspaceId-createdAt-index"
    hash_key        = "workspaceId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  tags = {
    Environment = var.environment
  }
}

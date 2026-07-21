output "bucket_name" {
  description = "Media assets S3 bucket name"
  value       = aws_s3_bucket.files.bucket
}

output "bucket_arn" {
  description = "Media assets S3 bucket ARN"
  value       = aws_s3_bucket.files.arn
}

output "table_name" {
  description = "DynamoDB metadata table name"
  value       = aws_dynamodb_table.files.name
}

output "table_arn" {
  description = "DynamoDB metadata table ARN"
  value       = aws_dynamodb_table.files.arn
}

output "access_logs_bucket_name" {
  description = "S3 access logs bucket name"
  value       = aws_s3_bucket.access_logs.bucket
}

output "bucket_name" { value = aws_s3_bucket.files.bucket }
output "bucket_arn" { value = aws_s3_bucket.files.arn }
output "table_name" { value = aws_dynamodb_table.files.name }
output "table_arn" { value = aws_dynamodb_table.files.arn }

output "function_arns" { value = { for k, v in aws_lambda_function.functions : k => v.arn } }
output "function_names" { value = { for k, v in aws_lambda_function.functions : k => v.function_name } }
output "s3_event_processor_arn" { value = aws_lambda_function.functions["s3-event-processor"].arn }
output "s3_event_processor_name" { value = aws_lambda_function.functions["s3-event-processor"].function_name }

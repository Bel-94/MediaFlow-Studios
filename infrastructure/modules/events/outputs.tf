output "queue_arn" { value = aws_sqs_queue.events.arn }
output "queue_url" { value = aws_sqs_queue.events.url }
output "dlq_arn" { value = aws_sqs_queue.dlq.arn }
output "dlq_name" { value = aws_sqs_queue.dlq.name }

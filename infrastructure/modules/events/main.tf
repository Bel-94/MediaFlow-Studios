# ── SQS Dead Letter Queue ──────────────────────────────────────────────────────
resource "aws_sqs_queue" "dlq" {
  name                      = "${var.project_name}-events-dlq-${var.environment}"
  message_retention_seconds = 1209600 # 14 days
}

# ── SQS Main Queue ─────────────────────────────────────────────────────────────
resource "aws_sqs_queue" "events" {
  name                       = "${var.project_name}-events-${var.environment}"
  visibility_timeout_seconds = 300 # must be >= Lambda timeout

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 3
  })
}

# ── Allow EventBridge to send messages to SQS ─────────────────────────────────
resource "aws_sqs_queue_policy" "events" {
  queue_url = aws_sqs_queue.events.url
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "events.amazonaws.com" }
      Action    = "sqs:SendMessage"
      Resource  = aws_sqs_queue.events.arn
      Condition = {
        ArnEquals = { "aws:SourceArn" = aws_cloudwatch_event_rule.s3_events.arn }
      }
    }]
  })
}

# ── EventBridge rule — capture S3 Object Created/Deleted ──────────────────────
resource "aws_cloudwatch_event_rule" "s3_events" {
  name        = "${var.project_name}-s3-events-${var.environment}"
  description = "Captures S3 object created and removed events"

  event_pattern = jsonencode({
    source      = ["aws.s3"]
    detail-type = ["Object Created", "Object Deleted"]
    detail = {
      bucket = { name = [{ prefix = var.project_name }] }
    }
  })
}

# ── EventBridge target → SQS ──────────────────────────────────────────────────
resource "aws_cloudwatch_event_target" "sqs" {
  rule      = aws_cloudwatch_event_rule.s3_events.name
  target_id = "SendToSQS"
  arn       = aws_sqs_queue.events.arn
}

# ── Lambda event source mapping (SQS → s3-event-processor) ───────────────────
resource "aws_lambda_event_source_mapping" "sqs_processor" {
  event_source_arn                   = aws_sqs_queue.events.arn
  function_name                      = var.s3_event_processor_arn
  batch_size                         = 10
  maximum_batching_window_in_seconds = 5
  function_response_types            = ["ReportBatchItemFailures"]
}

# ── Allow Lambda to be invoked from SQS ───────────────────────────────────────
resource "aws_lambda_permission" "sqs" {
  statement_id  = "AllowSQSTrigger"
  action        = "lambda:InvokeFunction"
  function_name = var.s3_event_processor_name
  principal     = "sqs.amazonaws.com"
  source_arn    = aws_sqs_queue.events.arn
}

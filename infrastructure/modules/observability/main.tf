# ── SNS Topic for alerts ───────────────────────────────────────────────────────
resource "aws_sns_topic" "alerts" {
  name              = "${var.project_name}-alerts-${var.environment}"
  kms_master_key_id = "alias/aws/sns"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ── Alarm 1: Lambda errors (all functions) ─────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each            = var.function_names
  alarm_name          = "${each.value}-errors-${var.environment}"
  alarm_description   = "Lambda ${each.value} error rate exceeded threshold"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 60
  statistic           = "Sum"
  threshold           = 5
  treat_missing_data  = "notBreaching"
  dimensions          = { FunctionName = each.value }
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
}

# ── Alarm 2: Lambda throttles (all functions) ──────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  for_each            = var.function_names
  alarm_name          = "${each.value}-throttles-${var.environment}"
  alarm_description   = "Lambda ${each.value} is being throttled"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  treat_missing_data  = "notBreaching"
  dimensions          = { FunctionName = each.value }
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# ── Alarm 3: Lambda duration (all functions, p99 > 10s) ───────────────────────
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  for_each            = var.function_names
  alarm_name          = "${each.value}-duration-${var.environment}"
  alarm_description   = "Lambda ${each.value} p99 duration exceeding 10s"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 60
  extended_statistic  = "p99"
  threshold           = 10000
  treat_missing_data  = "notBreaching"
  dimensions          = { FunctionName = each.value }
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# ── Alarm 4: DLQ depth ────────────────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "dlq_depth" {
  alarm_name          = "${var.project_name}-dlq-depth-${var.environment}"
  alarm_description   = "Messages are accumulating in the DLQ — processing failures need investigation"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "notBreaching"
  dimensions          = { QueueName = var.dlq_name }
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
}

# ── Alarm 5: Business — processing failures (EMF custom metric) ───────────────
resource "aws_cloudwatch_metric_alarm" "processing_failures" {
  alarm_name          = "${var.project_name}-processing-failures-${var.environment}"
  alarm_description   = "S3 event processor reported ProcessingFailures — check DLQ and logs"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ProcessingFailures"
  namespace           = "MediaFlow/DAM"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "notBreaching"
  dimensions = {
    Environment = var.environment
    Service     = var.function_names["s3-event-processor"]
  }
  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}

# ── Alarm 6: API Gateway 5XX ──────────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  alarm_name          = "${var.project_name}-api-5xx-${var.environment}"
  alarm_description   = "API Gateway 5XX errors elevated"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 60
  statistic           = "Sum"
  threshold           = 5
  treat_missing_data  = "notBreaching"
  dimensions = {
    ApiName = var.api_name
    Stage   = var.api_stage
  }
  alarm_actions = [aws_sns_topic.alerts.arn]
}

# ── Alarm 7: API Gateway latency p99 ──────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "api_latency" {
  alarm_name          = "${var.project_name}-api-latency-${var.environment}"
  alarm_description   = "API Gateway p99 latency > 3s"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "Latency"
  namespace           = "AWS/ApiGateway"
  period              = 60
  extended_statistic  = "p99"
  threshold           = 3000
  treat_missing_data  = "notBreaching"
  dimensions = {
    ApiName = var.api_name
    Stage   = var.api_stage
  }
  alarm_actions = [aws_sns_topic.alerts.arn]
}

locals {
  files_api_name     = var.function_names["files-api"]
  processor_name     = var.function_names["s3-event-processor"]
  business_namespace = "MediaFlow/DAM"
}

# ── CloudWatch Dashboard — ops + business pipeline ────────────────────────────
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}"

  dashboard_body = jsonencode({
    widgets = concat(
      # Row 0 — business pipeline KPIs
      [
        {
          type   = "metric"
          width  = 8
          height = 6
          properties = {
            title  = "Upload URLs issued"
            region = var.aws_region
            view   = "timeSeries"
            period = 60
            metrics = [
              [local.business_namespace, "UploadUrlIssued", "Environment", var.environment, "Service", local.files_api_name, { stat = "Sum", color = "#2ca02c" }],
              [".", "UploadUrlRejected", ".", ".", ".", ".", { stat = "Sum", color = "#d62728" }],
            ]
          }
        },
        {
          type   = "metric"
          width  = 8
          height = 6
          properties = {
            title  = "Uploads processed (S3 → DynamoDB)"
            region = var.aws_region
            view   = "timeSeries"
            period = 60
            metrics = [
              [local.business_namespace, "UploadProcessed", "Environment", var.environment, "Service", local.processor_name, { stat = "Sum", color = "#2ca02c" }],
              [".", "ProcessingFailures", ".", ".", ".", ".", { stat = "Sum", color = "#d62728" }],
              [".", "ProcessingIdempotentSkip", ".", ".", ".", ".", { stat = "Sum", color = "#ff7f0e" }],
            ]
          }
        },
        {
          type   = "metric"
          width  = 8
          height = 6
          properties = {
            title  = "File processing latency (ms)"
            region = var.aws_region
            view   = "timeSeries"
            period = 60
            metrics = [
              [local.business_namespace, "ProcessingLatencyMs", "Environment", var.environment, "Service", local.processor_name, { stat = "p50" }],
              ["...", { stat = "p99", color = "#d62728" }],
            ]
          }
        },
        {
          type   = "metric"
          width  = 12
          height = 6
          properties = {
            title  = "API Gateway — latency & 5XX"
            region = var.aws_region
            view   = "timeSeries"
            period = 60
            metrics = [
              ["AWS/ApiGateway", "Latency", "ApiName", var.api_name, "Stage", var.api_stage, { stat = "p50" }],
              ["...", { stat = "p99", color = "#d62728" }],
              [".", "5XXError", ".", ".", ".", ".", { stat = "Sum", yAxis = "right", color = "#ff7f0e" }],
            ]
          }
        },
        {
          type   = "metric"
          width  = 12
          height = 6
          properties = {
            title  = "API latency by operation (EMF)"
            region = var.aws_region
            view   = "timeSeries"
            period = 60
            metrics = [
              [local.business_namespace, "ApiLatencyMs", "Environment", var.environment, "Service", local.files_api_name, { stat = "p99" }],
            ]
          }
        },
      ],
      # Lambda Errors & Throttles
      [for name in values(var.function_names) : {
        type   = "metric"
        width  = 6
        height = 6
        properties = {
          title  = "${name} — Errors & Throttles"
          region = var.aws_region
          metrics = [
            ["AWS/Lambda", "Errors", "FunctionName", name, { stat = "Sum", color = "#d62728" }],
            ["AWS/Lambda", "Throttles", "FunctionName", name, { stat = "Sum", color = "#ff7f0e" }],
          ]
          period = 60
          view   = "timeSeries"
        }
      }],
      # Lambda Duration
      [for name in values(var.function_names) : {
        type   = "metric"
        width  = 6
        height = 6
        properties = {
          title  = "${name} — Duration (p50/p99)"
          region = var.aws_region
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", name, { stat = "p50" }],
            ["AWS/Lambda", "Duration", "FunctionName", name, { stat = "p99", color = "#d62728" }],
          ]
          period = 60
          view   = "timeSeries"
        }
      }],
      # DLQ
      [{
        type   = "metric"
        width  = 12
        height = 6
        properties = {
          title  = "DLQ — Messages Visible"
          region = var.aws_region
          metrics = [
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", var.dlq_name, { stat = "Maximum", color = "#d62728" }]
          ]
          period = 60
          view   = "timeSeries"
        }
      }],
      # Logs Insights deep-link style text
      [{
        type   = "text"
        width  = 24
        height = 3
        properties = {
          markdown = <<-EOT
            ## MediaFlow ops tips
            - **Logs Insights**: filter `fields @timestamp, level, message, correlationId | filter level = "ERROR"`
            - **Upload pipeline**: `UploadUrlIssued` → browser PUT to S3 → `UploadProcessed`
            - **Namespace**: `MediaFlow/DAM` (Embedded Metric Format from Lambda logs)
          EOT
        }
      }]
    )
  })
}

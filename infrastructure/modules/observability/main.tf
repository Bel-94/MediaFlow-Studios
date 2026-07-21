# ── SNS Topic for alerts ───────────────────────────────────────────────────────
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-alerts-${var.environment}"
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

# ── CloudWatch Dashboard ───────────────────────────────────────────────────────
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}"

  dashboard_body = jsonencode({
    widgets = concat(
      # Lambda Errors & Throttles row
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
      # Lambda Duration row
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
      # DLQ depth widget
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
      }]
    )
  })
}

locals {
  functions = ["files-api", "versions-api", "s3-event-processor", "analytics-api"]
}

# Generate a minimal placeholder zip so Terraform can create Lambda functions
# before real deployment packages are uploaded via CI/CD
data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"

  source {
    content  = "exports.handler = async () => ({ statusCode: 200, body: 'placeholder' });"
    filename = "index.js"
  }
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name               = "${var.project_name}-lambda-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy" "lambda" {
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["s3:*"], Resource = ["${var.bucket_arn}", "${var.bucket_arn}/*"] },
      { Effect = "Allow", Action = ["dynamodb:*"], Resource = [var.table_arn] },
      { Effect = "Allow", Action = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"], Resource = "*" },
      { Effect = "Allow", Action = ["xray:PutTraceSegments", "xray:PutTelemetryRecords"], Resource = "*" },
      { Effect = "Allow", Action = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"], Resource = var.queue_arn }
    ]
  })
}

resource "aws_lambda_function" "functions" {
  for_each         = toset(local.functions)
  function_name    = "${var.project_name}-${each.key}-${var.environment}"
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = data.archive_file.placeholder.output_path
  source_code_hash = data.archive_file.placeholder.output_base64sha256
  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      BUCKET_NAME = var.bucket_name
      TABLE_NAME  = var.table_name
      ENVIRONMENT = var.environment
    }
  }
}

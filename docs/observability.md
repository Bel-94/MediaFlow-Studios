# Observability runbook — MediaFlow DAM

## Dashboard

CloudWatch dashboard name: `s3files-{env}` (e.g. `s3files-dev`)

Widgets cover:
- Upload URLs issued / rejected
- Uploads processed vs processing failures
- Processing latency
- API Gateway latency & 5XX
- Per-Lambda errors, throttles, duration
- DLQ depth

## Custom metrics (`MediaFlow/DAM`)

| Metric | Meaning |
|---|---|
| `UploadUrlIssued` | Presigned URL returned to the browser |
| `UploadUrlRejected` | Validation failed before URL generation |
| `UploadProcessed` | S3 ObjectCreated indexed into DynamoDB |
| `ProcessingFailures` | Event processor threw (message → retry/DLQ) |
| `ProcessingLatencyMs` | Time to process one S3 event |
| `ApiLatencyMs` | Handler wall time |
| `ApiErrors` | Unhandled handler exceptions |

## Logs Insights starter queries

```
fields @timestamp, level, message, correlationId, workspaceId
| filter level = "ERROR"
| sort @timestamp desc
| limit 50
```

```
fields @timestamp, message, key, workspaceId
| filter message = "upload.url.issued"
| sort @timestamp desc
| limit 20
```

## Alarms → action

| Alarm | First checks |
|---|---|
| Lambda errors | Function logs for stack traces; recent deploy |
| ProcessingFailures | Processor logs + DLQ messages |
| DLQ depth | Reprocess after fix; see Phase D runbooks |
| API 5XX / latency | API Gateway + Lambda duration; Cognito auth spikes |

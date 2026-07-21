# Architecture

## Overview
S3 Files is a serverless file management platform on AWS.

## Components

```
Browser (Angular 17)
    │
    ▼
Amazon Cognito ──► API Gateway (HTTP API)
                        │
              ┌─────────┼──────────┐
              ▼         ▼          ▼
        files-api  versions-api  analytics-api
              │         │          │
              └─────────┴──────────┘
                        │
              ┌─────────┴──────────┐
              ▼                    ▼
           Amazon S3          DynamoDB
              │
              ▼
    s3-event-processor (Lambda)
```

## Data Flow

### Upload
1. Frontend requests a pre-signed URL via `POST /files/upload`
2. `files-api` Lambda returns a pre-signed S3 PUT URL
3. Frontend uploads directly to S3
4. S3 triggers `s3-event-processor` which writes metadata to DynamoDB

### List
1. `GET /files` calls `files-api` → `ListObjectsV2` on S3

### Versions
1. `GET /versions/{key}` calls `versions-api` → `ListObjectVersions` on S3

## AWS Services
| Service | Purpose |
|---|---|
| S3 | File storage with versioning |
| DynamoDB | File metadata & analytics |
| Lambda | Business logic |
| API Gateway | HTTP routing + JWT auth |
| Cognito | User auth |
| CloudWatch | Logs + metrics + dashboards |
| X-Ray | Distributed tracing |

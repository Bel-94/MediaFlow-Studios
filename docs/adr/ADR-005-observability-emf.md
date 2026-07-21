# ADR-005: Structured Logging and Embedded Metric Format

**Date:** 2026-07-21  
**Status:** Accepted  
**Phase:** C — Monitoring & observability

## Context

MediaFlow ops need to detect upload/pipeline issues before users report them. CloudWatch already had Lambda errors/throttles/duration and DLQ depth, but lacked **business** signals (upload URLs issued, files processed, processing latency).

## Decision

1. **Structured JSON logs** from all Lambdas (`shared/logger.ts`) with `level`, `message`, `correlationId`, and contextual fields.  
2. **CloudWatch Embedded Metric Format (EMF)** (`shared/metrics.ts`) to emit custom metrics into namespace `MediaFlow/DAM` without `PutMetricData` API calls.  
3. **Stable metric dimensions**: `Environment` + `Service` only (extra context stays in the log body for Logs Insights).  
4. Expand the CloudWatch dashboard and add alarms for `ProcessingFailures`, API 5XX, and API latency.

## Why

- EMF piggybacks on existing log ingestion — low cost, fits $0–5/mo demo target.  
- Structured logs make Logs Insights queries reliable.  
- Business metrics map directly to the MediaFlow upload pipeline.

## Tradeoffs

| Choice | Benefit | Tradeoff |
|---|---|---|
| EMF vs PutMetricData | No extra IAM/SDK calls | Metrics appear after log ingestion delay (~1 min) |
| Few dimensions | Simple dashboards/alarms | Workspace-level metric slicing needs Insights queries |
| JSON to stdout | Zero deps | Must keep log volume reasonable |

## Well-Architected

**Operational Excellence** (visibility, alarms) and **Cost Optimization** (reuse logs for metrics).

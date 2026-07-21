# ADR-001: Use S3 for File Storage

**Date:** 2024-01-01  
**Status:** Accepted

## Context
Need durable, scalable object storage with built-in versioning.

## Decision
Use Amazon S3 with versioning enabled.

## Consequences
- Built-in versioning at no extra infrastructure cost
- Pre-signed URLs allow direct browser-to-S3 uploads, reducing Lambda payload limits
- S3 event notifications enable async metadata indexing

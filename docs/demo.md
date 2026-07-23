# Demo walkthrough - MediaFlow Studios

5-minute path for interviewers or stakeholders.

## Prerequisites

1. Dev infrastructure applied (`infrastructure/environments/dev`)
2. Lambdas deployed: `.\scripts\deploy-functions.ps1 -Env dev`
3. Frontend deployed: `.\scripts\deploy-frontend.ps1 -Env dev`
4. Cognito demo user exists (Hosted UI sign-up, or create in console)

Local alternative: `.\scripts\sync-frontend-env.ps1 -Env dev` then `cd apps/frontend && npm start`

## Demo user

Sign up from the Hosted UI with a **real email** (email is the username). Password must be 12+ chars with upper, lower, number, and symbol.

Cognito will email a verification code — enter it to confirm, then you’ll land back in the app.

## Script (about 5 minutes)

1. **Open the app**
   CloudFront URL from SSM `/s3files/dev/cloudfront_domain` (or `http://localhost:4200`).

2. **Sign in**
   Click **Sign in** -> Cognito Hosted UI -> land on **Workspace**.

3. **Upload**
   Go to **Upload** -> drop a small image or PDF -> wait for 100% / done.

4. **Workspace**
   Open **Workspace** -> **Refresh** after a few seconds -> asset appears with name/size/type.

5. **Versions**
   Click the row or **Versions** -> see version list + download link.
   Optional: re-upload the same logical path story by uploading again and showing multiple versions on the S3 key (or restore).

6. **Analytics**
   Open **Analytics** -> show total files, size, uploads today.

7. **Sign out**
   Confirm Cognito logout returns to the app origin.

## Talking points

- Employees never touch S3 credentials; the API issues short-lived pre-signed URLs.
- Metadata is eventual via EventBridge -> SQS -> Lambda (resilient ingest).
- Auth is Cognito + PKCE; API Gateway enforces JWT on every data route.
- Security/quality gates run in CI (tfsec, Checkov, Gitleaks) before deploy.

## If something fails

| Symptom | Check |
|---------|--------|
| CORS error from CloudFront | Terraform API CORS should allow `*`; re-apply API module |
| Empty workspace after upload | Wait 5-10s, refresh; check `s3-event-processor` logs |
| Login loop | Confirm callback URL matches env (`/callback`) in Cognito app client |
| Logout error | Cognito `logout_urls` must include site root (no `/callback`) |

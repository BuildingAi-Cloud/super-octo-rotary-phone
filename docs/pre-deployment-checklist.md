# Pre-Deployment Checklist (Supabase + SMTP)

Use this checklist before production cutover.

## 1) Release Gate

- CI checks green on the release PR.
- Vercel preview is healthy and manually validated.
- `npm run build`, `npm run lint`, and `npm test` pass in CI.
- Dashboard Phase 1 wiring tests are passing.

## 2) Supabase Readiness

### Tenancy Decision

Pick one model and document it in the release notes:

- Shared project, shared database (`tenant_id` + RLS) for most customers.
- Dedicated Supabase project per enterprise customer if hard isolation is required.

### Required Controls

- Every tenant-owned table has `tenant_id`.
- RLS is enabled on tenant-owned tables.
- Policies enforce `tenant_id` scoping on `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
- Service-role usage is restricted to server-only code paths.

### Scale Baseline

- Add indexes that match hot query paths, typically prefixed by `tenant_id`.
- Confirm no unbounded table scans on high-traffic endpoints.
- Validate connection pooling settings for expected concurrent traffic.
- Verify backup/restore policy and retention windows.

### Go/No-Go Smoke Tests

- Sign in as at least two different tenant users and confirm strict data isolation.
- Confirm audit logs record auth and role-switch events.
- Confirm governance and dashboard reads respect tenant boundaries.

## 3) SMTP / Transactional Email Readiness

### Provider + Domain

- Provider selected (SES, Resend, SendGrid, Mailgun, etc.).
- Sending domain configured and verified.
- SPF, DKIM, and DMARC records published and validated.
- Sender identity (`From`) matches verified domain.

### App Configuration

- SMTP/API credentials stored as production secrets (never committed).
- Separate credentials for production and non-production.
- Rate limits and retry policy defined for email sends.
- Bounce/complaint webhooks configured and monitored.

### Functional Tests

- Password reset email delivered to external inbox.
- Invite/onboarding email delivered and actionable.
- Failed-send path logs meaningful error and does not break user flow.

## 4) Security + Compliance

- Production secrets rotation date recorded.
- Access review completed for Supabase and deployment platforms.
- Data retention and deletion rules validated.
- Incident response contact path documented.

## 5) Observability + Operations

- Error monitoring enabled for server and client runtime.
- Alert thresholds set for auth failures, API error spikes, and email failures.
- Dashboards in place for DB latency, API p95, and queue/backlog health.
- Rollback plan tested for app and database migration changes.

## 6) Launch Day Runbook

1. Freeze non-release merges.
2. Apply DB migrations.
3. Deploy app release.
4. Run post-deploy smoke tests:
   - Sign in/out
   - Dashboard routing by role
   - Password reset email
   - Core API checks
5. Monitor logs and alerts for at least 30-60 minutes.

## 7) Post-Launch Verification (24h)

- No tenant data leakage incidents.
- Password reset success rate within expected range.
- Email bounce/complaint rates within provider thresholds.
- Critical dashboards and governance flows stable.

# Release Readiness Checklist

## Phase 1: Build and Test Gate

- [ ] `npm run build` passes in CI.
- [ ] `npm test` passes in CI.
- [ ] `typescript.ignoreBuildErrors` is disabled for release builds.
- [ ] Lint is scoped to deployable source paths only.

## Phase 2: Backend and Server Connectivity

- [ ] API routes use durable stores (no in-memory OTP/session stores for production flows).
- [ ] DB connectivity uses environment-based secure credentials.
- [ ] Health endpoints are present for critical dependencies.
- [ ] Retry and timeout behavior is documented for upstream providers.

## Phase 3: SMTP and Email Operations

- [ ] Mail provider configured through server-side env vars only.
- [ ] No client payload includes API keys or SMTP credentials.
- [ ] SMTP health check endpoint responds with reachable/unreachable state.
- [ ] Mail sender domain and SPF/DKIM/DMARC records validated.

## Phase 4: Website Deployment

- [ ] Staging deployment validated before production promotion.
- [ ] Production deploy includes rollback instructions.
- [ ] Domain, TLS, and CDN cache strategy are verified.
- [ ] Post-deploy smoke checks are automated.

## Phase 5: Android and iOS Release Engineering

- [ ] Capacitor web artifact strategy is verified for release mode.
- [ ] Android signing (keystore, alias, secrets) is configured.
- [ ] iOS signing (certificates, provisioning profiles) is configured.
- [ ] Store metadata, screenshots, privacy declarations are complete.
- [ ] Internal/beta tracks validated before public rollout.

## Phase 6: Observability and Ops

- [ ] API error rates, latency, and uptime dashboards exist.
- [ ] Mobile crash reporting is enabled.
- [ ] Email deliverability and failure alerts are enabled.
- [ ] On-call escalation route is documented.

## Phase 7: Go-Live and Support

- [ ] Cutover checklist approved by product and engineering.
- [ ] Rollback checklist approved and rehearsed.
- [ ] Support playbook and triage SLA are active.
- [ ] First 48-hour hypercare owner is assigned.

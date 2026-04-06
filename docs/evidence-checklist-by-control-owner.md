# Evidence Checklist By Control Owner

Use this checklist to collect auditable evidence for ISO 27001, SOC 2 Type II, and GDPR readiness. Store artifacts in a versioned location and link them in the control matrix.

## Evidence Standards

- Every artifact must include: owner, date, system scope, and approval status.
- Screenshots alone are insufficient for recurring controls; include logs/exports/tickets.
- Evidence must demonstrate operation over time, not one-time configuration.

## Control Owner Checklist

### 1. Security Lead

- Information security policy and annual approval record
- Risk register with scoring methodology and treatment plan
- Incident response plan, test records, and post-incident reports
- Security awareness training records and completion metrics
- Internal audit schedule and management review notes

### 2. Engineering Manager

- SDLC policy and secure coding standards
- PR approval rules and branch protection settings
- CI logs proving build/lint/test gates and security scans
- Change tickets with approvals and deployment notes
- Release rollback plan and change failure review records

### 3. Platform / Infrastructure Owner

- Environment inventory (prod/staging/dev) and asset ownership
- Backup schedules and restoration test evidence
- Monitoring and alert coverage matrix for critical services
- High availability and disaster recovery runbooks
- Secrets management process and rotation evidence

### 4. Identity & Access Owner

- Access control policy and privileged access rules
- MFA enforcement proof for privileged accounts
- Joiner/mover/leaver tickets and deprovisioning timestamps
- Quarterly access review sign-off (system-by-system)
- Service account inventory with owner and purpose

### 5. Privacy Officer / Legal Owner

- Data processing inventory (ROPA) and lawful basis mapping
- DPA template, subprocessors list, and transfer mechanism clauses
- Data subject request workflow and SLA performance reports
- DPIA records for high-risk processing operations
- Retention and deletion policy with implementation evidence

### 6. Support Operations Owner

- Customer incident and escalation SOP
- Support access logs and approval controls for production access
- Ticket QA sample proving PII-safe handling
- Communication templates for privacy/security incidents
- Customer notification evidence for resolved incidents

### 7. Product Owner

- Feature-level privacy/security requirements in PRDs
- Release readiness checklist with compliance gate sign-off
- Role-based access acceptance criteria and test evidence
- Audit-log coverage for critical product actions
- Customer-facing trust/compliance statements review log

## Evidence Cadence Calendar

| Cadence | Required Evidence |
|---|---|
| Per release | CI output, change approvals, rollback verification |
| Weekly | Vulnerability triage, incident queue review |
| Monthly | Access review samples, backup job verification, DSR SLA report |
| Quarterly | Restore drills, incident tabletop exercise, policy acknowledgment review |
| Annual | Full risk assessment, internal audit cycle, management review |

## Audit Readiness Rules

1. Ensure each control has at least two evidence points inside the SOC 2 observation window.
2. For ISO surveillance and recertification, keep year-over-year continuity of evidence.
3. For GDPR readiness, retain proof of request handling and cross-border transfer decisions.
4. Tag each artifact with control IDs to avoid orphan evidence.

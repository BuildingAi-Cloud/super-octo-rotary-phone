# Compliance Control Matrix Template

Use this template as the master control library for beta-to-audit execution. Maintain one row per control and map it to ISO 27001, SOC 2 Type II, and GDPR obligations.

## Scope Baseline (BuildSync)

- Product scope: SaaS app, on-prem image, APIs, docs portal, support operations
- Data scope: resident/tenant data, operator accounts, audit logs, access events, payments metadata
- Environments: development, staging, production, customer on-prem
- Shared responsibility: customer configuration and local admin controls remain customer-owned for on-prem

## Control Matrix Columns

| Field | Description |
|---|---|
| Control ID | Unique ID, for example `AC-01`, `LOG-02` |
| Domain | Access, Change Management, Logging, Incident Response, etc. |
| Control Objective | What risk is being reduced |
| Control Statement | Testable statement of how control operates |
| ISO 27001 Mapping | Annex A / clause reference |
| SOC 2 TSC Mapping | CC/PI/A/C code reference |
| GDPR Mapping | Relevant article(s) |
| Control Owner | Named owner role |
| Operator | Team executing control day-to-day |
| System / Asset | App/service/repo/integration in scope |
| Frequency | Continuous, daily, weekly, monthly, quarterly |
| Evidence Source | Link/path to audit evidence |
| Last Tested | Date of latest effectiveness test |
| Status | Not Started, In Progress, Implemented, Needs Remediation |
| Risk if Fails | High/Medium/Low + impact summary |
| Remediation Plan | Action, owner, due date |

## Starter Control Set (Pre-filled)

| Control ID | Domain | Control Objective | Control Statement | ISO 27001 Mapping | SOC 2 Mapping | GDPR Mapping | Control Owner | Frequency | Status |
|---|---|---|---|---|---|---|---|---|---|
| IAM-01 | Access Control | Prevent unauthorized admin access | Privileged accounts require MFA and least-privilege role assignment | A.5.15, A.5.18 | CC6.1, CC6.2 | Art. 5(1)(f), Art. 32 | Security Lead | Continuous + quarterly review | In Progress |
| IAM-02 | Access Lifecycle | Remove stale access quickly | Joiner/mover/leaver process revokes access within SLA | A.5.18 | CC6.3 | Art. 32 | IT Ops Owner | Weekly + monthly review | Not Started |
| CHG-01 | Change Management | Ensure safe and approved production changes | Production changes require PR review, CI checks, and tracked approvals | A.8.32 | CC8.1 | Art. 25 | Engineering Manager | Per deployment | In Progress |
| SDLC-01 | Secure Development | Reduce vulnerable code release | SAST/dependency scanning runs in CI and blockers are triaged by severity SLA | A.8.28, A.8.8 | CC7.1, CC7.2 | Art. 32 | AppSec Owner | Per commit + weekly triage | In Progress |
| LOG-01 | Auditability | Preserve evidence for investigations | Security-relevant events are logged with timestamp, actor, action, outcome | A.8.15, A.8.16 | CC7.2, CC7.3 | Art. 30, Art. 32 | Platform Owner | Continuous | Implemented |
| IR-01 | Incident Response | Respond and recover from incidents | Incident runbook, severity model, escalation tree, and postmortems are maintained | A.5.24-A.5.27 | CC7.4, CC7.5 | Art. 33, Art. 34 | Security Lead | Quarterly test + real events | Not Started |
| BCM-01 | Backup & Recovery | Ensure availability and restoration | Backups are automated and restoration tests are completed on schedule | A.8.13, A.5.30 | A1.2, CC7.3 | Art. 32(1)(c) | Infrastructure Owner | Daily backups + quarterly restore tests | In Progress |
| VEN-01 | Vendor Risk | Reduce third-party risk | Subprocessors are assessed and contract clauses include security/privacy terms | A.5.19-A.5.22 | CC9.2 | Art. 28 | Legal + Security | Onboarding + annual review | Not Started |
| PRI-01 | Data Subject Rights | Meet privacy response obligations | DSR intake, verification, and fulfillment are tracked to SLA | A.5.34 | CC2.3 | Art. 12-23 | Privacy Officer | Continuous + monthly QA | In Progress |
| PRI-02 | Data Retention | Minimize over-retention risk | Data retention schedule and deletion workflows are enforced by policy | A.5.33 | CC8.1 | Art. 5(1)(e), Art. 25 | Data Governance Owner | Monthly | Not Started |

## Operating Rules

1. No control is considered implemented without evidence and test date.
2. Any control with High risk impact must have a remediation due date within 30 days.
3. Track compensating controls explicitly when a primary control is not yet feasible.
4. Keep one canonical matrix, then generate ISO/SOC/GDPR views from it.

## Beta Exit Gate (Compliance)

- 100% in-scope controls assigned to owners
- 90% controls at least In Progress with evidence path defined
- 0 High risk controls without approved remediation plan
- Signed management review of residual risk

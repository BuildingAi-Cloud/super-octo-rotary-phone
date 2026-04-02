# Onboarding Guide

Welcome to the platform! Here's how to get started:

## 1. Understand Your Role

BuildSync uses a four-tier hierarchy. Your dashboard and available features depend on your role:

| Tier | Role | Focus |
|------|------|-------|
| 1 | **Property Owner** | Strategic oversight — ROI, portfolio health, Pulse alerts |
| 2 | **Facility Manager** | Infrastructure — HVAC, electrical, plumbing, IoT sensors |
| 3 | **Building Manager** | Daily operations — tenant relations, amenities, staff |
| 4 | **Support Staff & Vendors** | Task execution — work orders, check-ins, photo uploads |

After signing in, the platform routes you to a role-specific dashboard automatically.

## 2. Explore Navigation
- Use the header or footer to access all major pages.
- Try the global search (`Ctrl+K`/`Cmd+K`) for instant navigation.

## 3. Accessibility First
- Click the accessibility icon in the header to adjust font, contrast, or font style.

## 4. Documentation & Support
- Access documentation and screenshots from the footer.
- Support is always one click away.

## 5. Your Dashboard
- **Owners** see a Pulse indicator (Green/Yellow/Red) and six tabs: Financials, Asset Health, Occupancy, Risk & Compliance, Smart Insights, and Team Panel (view-only analytics + team onboarding).
- **Facility Managers** see 15 tabs focused on technical infrastructure: Work Orders, Preventative Maintenance, Equipment, IoT Alerts, Vendors, Compliance, Assets, Space, Reports, Documents, Workflows, Vendor Database, Integrations, and Audit Log.
- **Building Managers (Super User)** see 17 tabs covering Overview (leasing pipeline, renewals), Comms, Onboarding, Amenities, Packages, Visitors, Keys, Work Orders, Incidents, Vendors, Documents, Violations, Analytics, Governance, User Directory, Access & CCTV, and Integrations.
- **Support Staff & Vendors** see a focused task/work-order view optimised for mobile.

## 6. Onboarding Hierarchy

BuildSync enforces a structured onboarding hierarchy — each role can only add users below them:

| Who | Can Add | Permission Level |
|-----|---------|-----------------|
| **Organization Admin / Building Owner (Tier 1)** | Building Manager, Facility Manager | Full Manager Access |
| **Building Manager (Tier 3 — Super User)** | Residents, Tenants, Concierge, Security, Staff | Operational / Resident Portal Access |
| **Facility Manager (Tier 2 — Technical Lead)** | Vendors, Contractors, Maintenance Staff | Work-Order Only Access |

### Three Onboarding Flows

1. **Self-Onboarding (Magic Links)** — Manager creates an invite code, shares it with the invitee. The invitee visits `/invite`, enters the code, creates a profile, and is automatically signed in with the correct role and permissions.
2. **Bulk CSV Import** — Building Managers can upload a CSV file (columns: name, email, unit, role) to onboard 200+ residents in a single batch. Import results show added, skipped (duplicates), and errors.
3. **RBAC Role Templates** — Every role has a pre-defined permission template (view financials, manage work orders, access settings, etc.) that is automatically assigned on account creation.

### Invite System
- Invite codes are 8-character alphanumeric strings valid for 7 days.
- Managers can view, copy, and revoke pending invites from their dashboard.
- Each invite is tied to a specific email and role — only the intended recipient can accept it.

---

Need help? Use the search or contact support anytime.

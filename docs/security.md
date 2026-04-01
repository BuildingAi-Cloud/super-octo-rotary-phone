# Security & Privacy

Buildings.com is built with privacy and security as core principles:

- End-to-end encryption for sensitive data
- Role-based access control
- Compliance with industry standards
- Regular security audits
- On-premise deployment for maximum data control

## Role-Based Access Control (RBAC)

The platform enforces a four-tier access hierarchy:

| Tier | Role(s) | Data Scope | Write Access |
|------|---------|------------|-------------|
| 1 | Property Owner | Full portfolio analytics (view-only) | CapEx approvals, budget sign-off |
| 2 | Facility Manager | All building systems & asset data | Work orders, maintenance schedules, vendor management |
| 3 | Building Manager | Tenant data, operations, front-of-house | Communications, onboarding, amenities, tickets |
| 4 | Concierge, Security, Staff, Vendor | Assigned tasks & limited building data | Task updates, photo uploads, ticket closure |

### Visibility Rules

- **Owners** see aggregated financial and operational KPIs. They do not see individual tenant PII or ticket details.
- **Facility Managers** see equipment data, sensor readings, and vendor contracts. They report asset health upward to the Owner.
- **Building Managers** see tenant details, communication history, and daily operational data. They act as the system super-user.
- **Support Staff & Vendors** see only their assigned work orders and relevant building areas.
- **Residents** see only their own unit data, amenity bookings, and service requests.

All role assignments are stored in the auth context and enforced at the route level (`/app/dashboard/page.tsx`).

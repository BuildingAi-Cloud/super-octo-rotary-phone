export const docsSignIn = {
  slug: "sign-in",
  title: "Sign In",
  keywords: ["login", "authentication", "access"],
  html: `<p>Use your email and password to sign in. If you forgot your password, contact your administrator.</p><p>The platform supports 12 roles across a four-tier hierarchy: Property Owner, Facility Manager, Building Manager, and Support Staff/Vendors. Each role routes to a dedicated dashboard after sign-in.</p>`
};

export const docsSignUp = {
  slug: "sign-up",
  title: "Sign Up",
  keywords: ["register", "create account", "onboarding", "role", "hierarchy"],
  html: `<p>To create an account, select your role, fill in your details, and follow the prompts. Some roles may require admin approval.</p><p>Available roles: Property Owner (Tier 1), Facility Manager (Tier 2), Building Manager (Tier 3), Concierge, Security, Staff, Vendor (Tier 4), Resident, Tenant, Admin, and Guest.</p>`
};

export const docsDashboard = {
  slug: "dashboard",
  title: "Dashboards",
  keywords: ["home", "overview", "role", "hierarchy", "owner", "facility manager", "building manager", "pulse"],
  html: `<p>Each user role has a dedicated dashboard aligned to the four-tier hierarchy:</p><ul><li><strong>Property Owner (Tier 1)</strong> — Pulse indicator, Financial Performance, Asset Health, Occupancy, Risk & Compliance, Smart Insights, Team Panel (6 tabs, view-only analytics + team onboarding).</li><li><strong>Facility Manager (Tier 2)</strong> — Technical Lead: Overview, Work Orders, Preventative Maintenance, Equipment, IoT Alerts, Vendors, Compliance, Assets, Space, Reports, Documents, Workflows, Vendor Database, Integrations, Audit Log (15 tabs).</li><li><strong>Building Manager (Tier 3)</strong> — Super User: Overview, Comms, Onboarding, Amenities, Packages, Visitors, Keys, Work Orders, Incidents, Vendors, Documents, Violations, Analytics, Governance, User Directory, Access & CCTV, Integrations (17 tabs).</li><li><strong>Support Staff & Vendors (Tier 4)</strong> — Task-focused, mobile-first work order views.</li></ul>`
};

export const docsSettings = {
  slug: "settings",
  title: "Settings",
  keywords: ["admin", "smtp", "sendgrid", "communication"],
  html: `<p>Admins and managers can configure communication settings (SMTP, SendGrid) and system options from the settings page.</p>`
};

export const docsAuditLog = {
  slug: "audit-log",
  title: "Audit Log",
  keywords: ["admin", "logs", "history"],
  html: `<p>The audit log tracks key actions (sign-in, sign-out, settings changes, etc.) for security and compliance. Only admins can view it.</p>`
};

export const docsAccessibility = {
  slug: "accessibility",
  title: "Accessibility",
  keywords: ["a11y", "contrast", "font", "dyslexia"],
  html: `<p>Accessibility options include large font, high contrast, and dyslexia-friendly modes. Toggle these from the header menu.</p>`
};

export const docsOnboardingHierarchy = {
  slug: "onboarding-hierarchy",
  title: "Onboarding Hierarchy",
  keywords: ["onboarding", "invite", "magic link", "CSV import", "bulk import", "RBAC", "permissions", "add user"],
  html: `<p>BuildSync enforces a structured onboarding hierarchy — each role can only add users below them in the chain:</p><ul><li><strong>Organization Admin / Building Owner (Tier 1)</strong> → adds Building Managers, Facility Managers only (Full Manager Access). Cannot add residents or tenants.</li><li><strong>Building Manager (Tier 3 — Super User)</strong> → adds Residents, Tenants, Concierge, Security, Staff (Operational / Resident Portal Access).</li><li><strong>Facility Manager (Tier 2)</strong> → adds Vendors, Contractors, Maintenance Staff (Work-Order Only Access).</li></ul><p>Three onboarding flows: (1) Self-Onboarding via magic links / invite codes, (2) Bulk CSV Import for 200+ residents, (3) RBAC role templates for automatic permission assignment. Invite codes are 8-character alphanumeric, valid for 7 days.</p>`
};

export const docsIntegrations = {
  slug: "integrations",
  title: "Integrations & Interoperability",
  keywords: ["integration", "API", "ERP", "Yardi", "MRI", "AppFolio", "access control", "Brivo", "HID", "Salto", "BMS", "IoT", "BACnet", "Modbus", "MQTT", "vendor portal", "magic link", "CSV importer", "webhook", "open ecosystem"],
  html: `<p>BuildSync's Open Ecosystem connects to four integration layers:</p><ol><li><strong>Financial & Accounting (ERP)</strong> — Yardi, MRI Software, AppFolio, QuickBooks, Sage Intacct, Rent Manager via REST APIs and webhooks. Bi-directional sync for leases, invoices, and GL entries.</li><li><strong>Physical Access Control</strong> — Brivo, HID, Salto, Verkada, LiftMaster via cloud-to-cloud APIs. Grant/revoke credentials, audit access events in real time.</li><li><strong>BMS & IoT</strong> — BACnet/IP, Modbus TCP/RTU, MQTT protocol gateways, Schneider EcoStruxure, Johnson Controls Metasys, Honeywell Forge. Ingest sensor telemetry for HVAC, lighting, metering.</li><li><strong>Vendor Portals</strong> — Magic Links (zero-install, token-based task completion), QR Codes, CSV Importers, Slack and Gmail notifications. Vendors complete work orders without creating accounts.</li></ol><p>Connection strategy: Software→Software (REST/GraphQL), Software→Hardware (Cloud APIs/SDKs), Software→Building (Protocol Gateways), Software→Human (Magic Links/QR).</p>`
};

export const docsUserHierarchy = {
  slug: "user-hierarchy",
  title: "User Hierarchy",
  keywords: ["hierarchy", "roles", "owner", "facility manager", "building manager", "vendor", "concierge", "staff", "tier", "RBAC"],
  html: `<p>BuildSync organises users into a four-tier operational hierarchy:</p><ol><li><strong>Property Owner (Tier 1)</strong> — Strategic oversight ("Investor"). Sees the building as a business unit. Dashboard: Pulse indicator, financials, asset health, occupancy, risk, smart insights, team panel (6 tabs, view-only). Key question: "Is my money safe and growing?"</li><li><strong>Facility Manager (Tier 2)</strong> — Technical lead. Manages infrastructure, HVAC, electrical, plumbing, IoT sensors, and technical vendors. Dashboard: 15 tabs covering work orders, preventative maintenance, equipment, compliance, assets, space, vendor database, integrations. Key question: "Is the equipment running and compliant?"</li><li><strong>Building Manager (Tier 3)</strong> — Daily operator and platform super-user. Manages tenants, staff, amenities, governance, and front-of-house. Dashboard: 17 tabs with full platform access including Overview (leasing pipeline, renewals), Governance, Integrations, and all operational modules. Key question: "Are the tenants happy and is the building orderly?"</li><li><strong>Support Staff & Vendors (Tier 4)</strong> — Task execution. Mobile-first work order views. Key question: "What do I need to do right now?"</li></ol><p>Data flows upward: Tier 4 closes tickets → Tier 2/3 reviews and updates records → Tier 1 sees aggregated KPIs and alerts.</p><p><em>Note: The Property Manager role has been merged into Building Manager. Existing PM users are automatically routed to the BM dashboard.</em></p>`
};

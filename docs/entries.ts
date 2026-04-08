export interface InlineDocEntry {
  kind: "inline";
  slug: string;
  title: string;
  keywords: string[];
  summary: string;
  category: "Account" | "Roles & Access" | "Operations" | "Platform";
  html: string;
}

export interface MarkdownDocEntry {
  kind: "page";
  slug: string;
  title: string;
  summary: string;
  keywords: string[];
  category: "Getting Started" | "Guides" | "Security" | "Reference";
}

export const docsSignIn: InlineDocEntry = {
  kind: "inline",
  slug: "sign-in",
  title: "Sign In",
  keywords: ["login", "authentication", "access"],
  summary: "How users authenticate and land on the correct role dashboard.",
  category: "Account",
  html: `<p>Use your email and password to sign in. If you forgot your password, contact your administrator.</p><p>The platform supports 12 roles across a four-tier hierarchy: Property Owner, Facility Manager, Building Manager, and Support Staff/Vendors. Each role routes to a dedicated dashboard after sign-in.</p>`
};

export const docsSignUp: InlineDocEntry = {
  kind: "inline",
  slug: "sign-up",
  title: "Sign Up",
  keywords: ["register", "create account", "onboarding", "role", "hierarchy"],
  summary: "Account creation flow, role selection, and onboarding expectations.",
  category: "Account",
  html: `<p>To create an account, select your role, fill in your details, and follow the prompts. Some roles may require admin approval.</p><p>Available roles: Property Owner (Tier 1), Facility Manager (Tier 2), Building Manager (Tier 3), Concierge, Security, Staff, Vendor (Tier 4), Resident, Tenant, Admin, and Guest.</p>`
};

export const docsDashboard: InlineDocEntry = {
  kind: "inline",
  slug: "dashboard",
  title: "Dashboards",
  keywords: ["home", "overview", "role", "hierarchy", "owner", "facility manager", "building manager", "pulse"],
  summary: "Role-based dashboard map across owner, FM, BM, and support roles.",
  category: "Roles & Access",
  html: `<p>Each user role has a dedicated dashboard aligned to the four-tier hierarchy:</p><ul><li><strong>Property Owner (Tier 1)</strong> — Pulse indicator, Financial Performance, Asset Health, Occupancy, Risk & Compliance, Smart Insights, Team Panel (6 tabs, view-only analytics + team onboarding).</li><li><strong>Facility Manager (Tier 2)</strong> — Technical Lead: Overview, Work Orders, Preventative Maintenance, Equipment, IoT Alerts, Vendors, Compliance, Assets, Space, Reports, Documents, Workflows, Vendor Database, Integrations, Audit Log (15 tabs).</li><li><strong>Building Manager (Tier 3)</strong> — Super User: Overview, Comms, Onboarding, Amenities, Packages, Visitors, Keys, Work Orders, Incidents, Vendors, Documents, Violations, Analytics, Governance, User Directory, Access & CCTV, Integrations (17 tabs).</li><li><strong>Support Staff & Vendors (Tier 4)</strong> — Task-focused, mobile-first work order views.</li></ul>`
};

export const docsSettings: InlineDocEntry = {
  kind: "inline",
  slug: "settings",
  title: "Settings",
  keywords: ["admin", "smtp", "sendgrid", "communication"],
  summary: "Manager and admin settings for communications and system behavior.",
  category: "Platform",
  html: `<p>Admins and managers can configure communication settings (SMTP, SendGrid) and system options from the settings page.</p>`
};

export const docsAuditLog: InlineDocEntry = {
  kind: "inline",
  slug: "audit-log",
  title: "Audit Log",
  keywords: ["admin", "logs", "history"],
  summary: "Track sensitive actions and platform changes for review and compliance.",
  category: "Platform",
  html: `<p>The audit log tracks key actions (sign-in, sign-out, settings changes, etc.) for security and compliance. Only admins can view it.</p>`
};

export const docsAccessibility: InlineDocEntry = {
  kind: "inline",
  slug: "accessibility",
  title: "Accessibility",
  keywords: ["a11y", "contrast", "font", "dyslexia"],
  summary: "Accessibility modes such as large font, contrast, and dyslexia-friendly views.",
  category: "Platform",
  html: `<p>Accessibility options include large font, high contrast, and dyslexia-friendly modes. Toggle these from the header menu.</p>`
};

export const docsOnboardingHierarchy: InlineDocEntry = {
  kind: "inline",
  slug: "onboarding-hierarchy",
  title: "Onboarding Hierarchy",
  keywords: ["onboarding", "invite", "magic link", "CSV import", "bulk import", "RBAC", "permissions", "add user"],
  summary: "Who can invite whom, and how self-onboarding and CSV imports are structured.",
  category: "Roles & Access",
  html: `<p>BuildSync enforces a structured onboarding hierarchy — each role can only add users below them in the chain:</p><ul><li><strong>Organization Admin / Building Owner (Tier 1)</strong> → adds Building Managers, Facility Managers only (Full Manager Access). Cannot add residents or tenants.</li><li><strong>Building Manager (Tier 3 — Super User)</strong> → adds Residents, Tenants, Concierge, Security, Staff (Operational / Resident Portal Access).</li><li><strong>Facility Manager (Tier 2)</strong> → adds Vendors, Contractors, Maintenance Staff (Work-Order Only Access).</li></ul><p>Three onboarding flows: (1) Self-Onboarding via magic links / invite codes, (2) Bulk CSV Import for 200+ residents, (3) RBAC role templates for automatic permission assignment. Invite codes are 8-character alphanumeric, valid for 7 days.</p>`
};

export const docsIntegrations: InlineDocEntry = {
  kind: "inline",
  slug: "integrations",
  title: "Integrations & Interoperability",
  keywords: ["integration", "API", "ERP", "Yardi", "MRI", "AppFolio", "access control", "Brivo", "HID", "Salto", "BMS", "IoT", "BACnet", "Modbus", "MQTT", "vendor portal", "magic link", "CSV importer", "webhook", "open ecosystem"],
  summary: "How BuildSync connects with ERPs, access control, BMS/IoT, and vendor workflows.",
  category: "Operations",
  html: `<p>BuildSync's Open Ecosystem connects to four integration layers:</p><ol><li><strong>Financial & Accounting (ERP)</strong> — Yardi, MRI Software, AppFolio, QuickBooks, Sage Intacct, Rent Manager via REST APIs and webhooks. Bi-directional sync for leases, invoices, and GL entries.</li><li><strong>Physical Access Control</strong> — Brivo, HID, Salto, Verkada, LiftMaster via cloud-to-cloud APIs. Grant/revoke credentials, audit access events in real time.</li><li><strong>BMS & IoT</strong> — BACnet/IP, Modbus TCP/RTU, MQTT protocol gateways, Schneider EcoStruxure, Johnson Controls Metasys, Honeywell Forge. Ingest sensor telemetry for HVAC, lighting, metering.</li><li><strong>Vendor Portals</strong> — Magic Links (zero-install, token-based task completion), QR Codes, CSV Importers, Slack and Gmail notifications. Vendors complete work orders without creating accounts.</li></ol><p>Connection strategy: Software→Software (REST/GraphQL), Software→Hardware (Cloud APIs/SDKs), Software→Building (Protocol Gateways), Software→Human (Magic Links/QR).</p>`
};

export const docsUserHierarchy: InlineDocEntry = {
  kind: "inline",
  slug: "user-hierarchy",
  title: "User Hierarchy",
  keywords: ["hierarchy", "roles", "owner", "facility manager", "building manager", "vendor", "concierge", "staff", "tier", "RBAC"],
  summary: "Understand the four-tier operating model and what each role can see and do.",
  category: "Roles & Access",
  html: `<p>BuildSync organises users into a four-tier operational hierarchy:</p><ol><li><strong>Property Owner (Tier 1)</strong> — Strategic oversight ("Investor"). Sees the building as a business unit. Dashboard: Pulse indicator, financials, asset health, occupancy, risk, smart insights, team panel (6 tabs, view-only). Key question: "Is my money safe and growing?"</li><li><strong>Facility Manager (Tier 2)</strong> — Technical lead. Manages infrastructure, HVAC, electrical, plumbing, IoT sensors, and technical vendors. Dashboard: 15 tabs covering work orders, preventative maintenance, equipment, compliance, assets, space, vendor database, integrations. Key question: "Is the equipment running and compliant?"</li><li><strong>Building Manager (Tier 3)</strong> — Daily operator and platform super-user. Manages tenants, staff, amenities, governance, and front-of-house. Dashboard: 17 tabs with full platform access including Overview (leasing pipeline, renewals), Governance, Integrations, and all operational modules. Key question: "Are the tenants happy and is the building orderly?"</li><li><strong>Support Staff & Vendors (Tier 4)</strong> — Task execution. Mobile-first work order views. Key question: "What do I need to do right now?"</li></ol><p>Data flows upward: Tier 4 closes tickets → Tier 2/3 reviews and updates records → Tier 1 sees aggregated KPIs and alerts.</p><p><em>Note: The Property Manager role has been merged into Building Manager. Existing PM users are automatically routed to the BM dashboard.</em></p>`
};

export const markdownDocs: MarkdownDocEntry[] = [
  {
    kind: "page",
    slug: "getting-started",
    title: "Getting Started",
    summary: "Install, run locally, and sign in with seeded demo roles.",
    keywords: ["setup", "install", "local", "demo accounts"],
    category: "Getting Started",
  },
  {
    kind: "page",
    slug: "overview",
    title: "Overview",
    summary: "Platform overview, four-tier operating model, and deployment references.",
    keywords: ["overview", "roles", "deployment"],
    category: "Getting Started",
  },
  {
    kind: "page",
    slug: "features",
    title: "Features",
    summary: "Feature catalog and integration-oriented product capabilities.",
    keywords: ["features", "modules", "integrations"],
    category: "Guides",
  },
  {
    kind: "page",
    slug: "onboarding",
    title: "Onboarding",
    summary: "User, building, and process onboarding guidance.",
    keywords: ["onboarding", "setup", "users"],
    category: "Guides",
  },
  {
    kind: "page",
    slug: "search-and-navigation",
    title: "Search and Navigation",
    summary: "How global search, docs discovery, and route navigation work together.",
    keywords: ["search", "navigation", "docs"],
    category: "Guides",
  },
  {
    kind: "page",
    slug: "security",
    title: "Security",
    summary: "Security posture, auditability, and operational controls.",
    keywords: ["security", "audit", "compliance"],
    category: "Security",
  },
  {
    kind: "page",
    slug: "compliance-control-matrix-template",
    title: "Compliance Control Matrix Template",
    summary: "Unified control mapping template for ISO 27001, SOC 2 Type II, and GDPR readiness.",
    keywords: ["compliance", "control matrix", "iso 27001", "soc 2", "gdpr"],
    category: "Security",
  },
  {
    kind: "page",
    slug: "evidence-checklist-by-control-owner",
    title: "Evidence Checklist By Control Owner",
    summary: "Role-based evidence checklist to prepare for certification and attestation audits.",
    keywords: ["evidence", "audit", "control owner", "readiness"],
    category: "Security",
  },
  {
    kind: "page",
    slug: "compliance-90-day-readiness-plan",
    title: "Compliance 90-Day Readiness Plan",
    summary: "Execution milestones and weekly deliverables for ISO 27001, SOC 2, and GDPR readiness.",
    keywords: ["roadmap", "90-day", "iso", "soc2", "gdpr"],
    category: "Security",
  },
  {
    kind: "page",
    slug: "api-reference",
    title: "API Reference",
    summary: "Reference material for API surface and integration behavior.",
    keywords: ["api", "reference", "developer"],
    category: "Reference",
  },
  {
    kind: "page",
    slug: "support",
    title: "Support",
    summary: "Support model, escalation guidance, and troubleshooting entry points.",
    keywords: ["support", "help", "troubleshooting"],
    category: "Reference",
  },
  {
    kind: "page",
    slug: "plugins",
    title: "Plugins",
    summary: "Extensibility and plugin integration guidance.",
    keywords: ["plugins", "extensibility", "integration"],
    category: "Reference",
  },
  {
    kind: "page",
    slug: "hybrid-deployment",
    title: "Hybrid Deployment",
    summary: "SaaS plus on-prem operating model, distribution, and local agent handshake pattern.",
    keywords: ["hybrid", "saas", "on-prem", "ollama", "ghcr"],
    category: "Reference",
  },
  {
    kind: "page",
    slug: "hybrid-architecture-map",
    title: "Hybrid Architecture Map",
    summary: "Diagram and handshake flow for SaaS plus local-agent on-prem data processing.",
    keywords: ["architecture", "handshake", "local-first", "agent"],
    category: "Reference",
  },
  {
    kind: "page",
    slug: "pre-deployment-checklist",
    title: "Pre-Deployment Checklist",
    summary: "Production go-live checklist for Supabase tenancy/scaling and SMTP readiness.",
    keywords: ["deployment", "supabase", "smtp", "go-live", "checklist"],
    category: "Reference",
  },
  {
    kind: "page",
    slug: "ai-brand-voice-guide",
    title: "AI Brand Voice Guide",
    summary: "Silent Architect persona, vocabulary guardrails, and predictive transparency UX rules.",
    keywords: ["ai voice", "persona", "style guide", "transparency"],
    category: "Guides",
  },
  {
    kind: "page",
    slug: "accessibility",
    title: "Accessibility Guide",
    summary: "Accessibility expectations and supported user experience modes.",
    keywords: ["accessibility", "a11y", "contrast"],
    category: "Security",
  },
  {
    kind: "page",
    slug: "user-flows-and-wireframes",
    title: "User Flows and Wireframes",
    summary: "Role-by-role operational flows and dashboard wireframes.",
    keywords: ["user flows", "wireframes", "roles"],
    category: "Guides",
  },
];

"use client"

import Link from "next/link"
import React from "react"
import { useEffect, useMemo, useState } from "react"
import { GlobalSearch } from "@/components/global-search"
import { ThemeToggle } from "@/components/theme-toggle"

const leftNav = [
  {
    heading: "Overview",
    items: [
      { label: "Welcome", href: "#welcome" },
      { label: "Product Map", href: "#product-map" },
      { label: "Platform Modules", href: "#platform-modules" },
    ],
  },
  {
    heading: "Users & Workflows",
    items: [
      { label: "Role Flows", href: "#role-flows" },
      { label: "Facility Manager", href: "#facility-manager" },
      { label: "Property Manager", href: "#property-manager" },
      { label: "Staff", href: "#staff" },
      { label: "Concierge", href: "#concierge" },
      { label: "Resident", href: "#resident" },
    ],
  },
  {
    heading: "Delivery & Governance",
    items: [
      { label: "Implementation Path", href: "#implementation-path" },
      { label: "Security & Compliance", href: "#security-compliance" },
      { label: "API Access", href: "#api-access" },
      { label: "FAQ", href: "#faq" },
    ],
  },
]

const toc = [
  { label: "Welcome", href: "#welcome" },
  { label: "Product Map", href: "#product-map" },
  { label: "Platform Modules", href: "#platform-modules" },
  { label: "Role Flows", href: "#role-flows" },
  { label: "Implementation Path", href: "#implementation-path" },
  { label: "Security & Compliance", href: "#security-compliance" },
  { label: "API Access", href: "#api-access" },
  { label: "FAQ", href: "#faq" },
]

const badgeColors: Record<string, string> = {
  "SaaS Based": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Device Based": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Vendor Based": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "API Based": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
}

const productMap = [
  {
    title: "Operations Core",
    summary: "Daily execution for facilities and property teams.",
    points: ["Work orders", "Preventive maintenance", "Vendor workflows", "Incident logging"],
    badges: ["SaaS Based", "API Based", "Vendor Based"],
  },
  {
    title: "Resident Experience",
    summary: "Digital journeys for residents and concierge teams.",
    points: ["Amenity booking", "Visitor and package handling", "Announcements", "Request tracking"],
    badges: ["SaaS Based", "Device Based"],
  },
  {
    title: "Security and Governance",
    summary: "Controls, auditability, and policy lifecycle.",
    points: ["Access control", "Governance voting", "Audit log", "Role-based permissions"],
    badges: ["SaaS Based", "API Based"],
  },
]

const moduleGroups = [
  {
    name: "Front Office",
    modules: ["Concierge Desk", "Visitor Management", "Package Management", "Resident Directory"],
    badges: ["SaaS Based", "Device Based"],
  },
  {
    name: "Building Operations",
    modules: ["Maintenance Hub", "Asset Tracking", "Compliance Docs", "Shift Logs"],
    badges: ["SaaS Based", "API Based"],
  },
  {
    name: "Portfolio and Leasing",
    modules: ["Leasing Pipeline", "Renewals", "Occupancy Analytics", "Commercial Management"],
    badges: ["SaaS Based"],
  },
  {
    name: "Platform Admin",
    modules: ["User Directory", "Integrations", "API Access", "System Settings"],
    badges: ["SaaS Based", "API Based", "Vendor Based"],
  },
]

const implementationPath = [
  {
    phase: "Phase 1 · Foundation",
    tasks: [
      "Configure roles and permissions",
      "Import buildings, units, and resident records",
      "Set organization settings and notification channels",
    ],
  },
  {
    phase: "Phase 2 · Core Operations",
    tasks: [
      "Enable work order routing and SLAs",
      "Set amenity inventory and booking policies",
      "Launch concierge workflows for visitors and packages",
    ],
  },
  {
    phase: "Phase 3 · Automation and Insights",
    tasks: [
      "Connect integrations and APIs",
      "Enable governance and audit workflows",
      "Deploy KPI dashboards and reporting cadence",
    ],
  },
]

const faqItems = [
  {
    q: "Which role should start first?",
    a: "Start with Facility Manager or Property Manager roles. They establish data quality, process ownership, and baseline workflows for all other users.",
  },
  {
    q: "Can we roll this out building by building?",
    a: "Yes. BuildSync supports phased rollout by property, portfolio, or business unit so teams can onboard progressively without disrupting operations.",
  },
  {
    q: "How do we manage compliance records?",
    a: "Use the Documents and Governance modules to store, review, and audit compliance artifacts with access controls and role-based approvals.",
  },
]

const roleDetails = {
  "facility-manager": {
    title: "Facility Manager",
    summary: "Oversees operational execution across the portfolio.",
    responsibilities: [
      "Portfolio KPI monitoring and performance tracking",
      "Amenity approval workflows and configuration",
      "Work order assignment and escalation",
      "Preventive maintenance scheduling",
      "Compliance reporting and audit trails"
    ],
    keyFeatures: [
      "Dashboard with real-time alerts",
      "SLA management and escalation",
      "Bulk import and reporting tools",
      "Integration with maintenance vendors"
    ],
    accessLevel: "Administrative"
  },
  "property-manager": {
    title: "Property Manager",
    summary: "Manages property-level operations and resident relationships.",
    responsibilities: [
      "Property and unit-level management",
      "Resident onboarding and approvals",
      "Service request oversight",
      "Documentation and policy updates",
      "Leasing pipeline and renewals tracking"
    ],
    keyFeatures: [
      "Occupancy and lease management",
      "Resident communication workflows",
      "Document upload and versioning",
      "Leasing analytics and forecasting"
    ],
    accessLevel: "Property level"
  },
  "staff": {
    title: "Staff",
    summary: "Executes day-to-day operational tasks.",
    responsibilities: [
      "Task and work order completion",
      "Progress updates and notes",
      "Photo and proof-of-work uploads",
      "Schedule adherence",
      "Incident and escalation reporting"
    ],
    keyFeatures: [
      "Mobile-friendly task interface",
      "Photo and attachment uploads",
      "Progress tracking",
      "Offline capability"
    ],
    accessLevel: "Assigned tasks only"
  },
  "concierge": {
    title: "Concierge",
    summary: "Front-line interface for residents and visitors.",
    responsibilities: [
      "Visitor and delivery registration",
      "Package intake and handoff tracking",
      "Amenity booking management",
      "Service request submission",
      "Incident and emergency logging"
    ],
    keyFeatures: [
      "Visitor log and management",
      "Package tracking system",
      "Amenity booking interface",
      "Incident quick-log"
    ],
    accessLevel: "Building level"
  },
  "resident": {
    title: "Resident",
    summary: "Self-service portal for residents.",
    responsibilities: [
      "Viewing announcements and updates",
      "Booking amenities and services",
      "Submitting maintenance requests",
      "Monitoring request status",
      "Managing community access and profile"
    ],
    keyFeatures: [
      "Announcements and communication feed",
      "Amenity booking calendar",
      "Service request tracking",
      "Community directory access"
    ],
    accessLevel: "Self-service"
  }
}

function RoleFlowsSection() {
  const [selected, setSelected] = React.useState<string | null>(null)
  const roles = Object.entries(roleDetails).map(([id, details]) => ({ id, ...details }))

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelected(selected === role.id ? null : role.id)}
            className={`text-left rounded-lg border p-4 transition-all duration-200 ${
              selected === role.id
                ? "border-accent bg-accent/10 ring-2 ring-accent/50"
                : "border-border/40 bg-card/20 hover:border-border/60"
            }`}
          >
            <h3 className="font-[var(--font-bebas)] text-2xl tracking-wide">{role.title}</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{role.summary}</p>
          </button>
        ))}
      </div>

      {selected && roleDetails[selected as keyof typeof roleDetails] && (
        <div className="rounded-xl border border-border/40 bg-card/20 p-6 mt-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Responsibilities</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {roleDetails[selected as keyof typeof roleDetails].responsibilities.map((resp) => (
                  <li key={resp} className="leading-relaxed">• {resp}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Key Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {roleDetails[selected as keyof typeof roleDetails].keyFeatures.map((feature) => (
                  <li key={feature} className="leading-relaxed">• {feature}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border/30 bg-background/40 p-4">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Access Level</h3>
              <p className="text-sm text-foreground font-medium">{roleDetails[selected as keyof typeof roleDetails].accessLevel}</p>
              <button
                onClick={() => setSelected(null)}
                className="mt-4 w-full text-xs border border-border/40 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("welcome")

  const sectionIds = useMemo(() => {
    const ids = [
      ...leftNav.flatMap((group) => group.items.map((item) => item.href.replace("#", ""))),
      ...toc.map((item) => item.href.replace("#", "")),
    ]
    return Array.from(new Set(ids))
  }, [])

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section))

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id)
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [sectionIds])

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 pt-24 pb-12">
      <div className="grid grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)_200px] gap-8">
        <aside className="hidden xl:block">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-4 space-y-5">
            <GlobalSearch />
            {leftNav.map((group) => (
              <div key={group.heading}>
                <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{group.heading}</h2>
                <ul className="space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        aria-current={item.href === `#${activeSection}` ? "location" : undefined}
                        className={`block rounded px-2 py-1 text-sm transition-colors ${
                          item.href === `#${activeSection}`
                            ? "bg-accent/10 text-accent"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <section className="min-w-0 space-y-8">
          <div id="welcome" className="mb-8">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Get Started</span>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button className="text-xs border border-border/40 rounded-lg px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                  Copy page
                </button>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">BuildSync Documentation</h1>
            <p className="mt-3 text-muted-foreground max-w-3xl leading-relaxed text-base">
              Documentation for operators, managers, and residents. Learn role workflows, platform modules, and implementation patterns quickly.
            </p>
          </div>

          <section id="product-map" className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">Product Map</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {productMap.map((area) => (
                <article key={area.title} className="rounded-lg border border-border bg-card p-5">
                  <h3 className="text-lg font-semibold">{area.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{area.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {area.points.map((point) => (
                      <span key={point} className="text-xs rounded-md border border-border/40 px-2 py-1 text-muted-foreground">
                        {point}
                      </span>
                    ))}
                  </div>
                  {area.badges && area.badges.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-border/30">
                      {area.badges.map((badge) => (
                        <span key={badge} className={`text-xs rounded-md border px-2 py-1 ${badgeColors[badge] || 'bg-border/20 text-foreground'}`}>
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section id="platform-modules" className="rounded-lg border border-border bg-card p-5 md:p-6 mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Platform Modules</h2>
            <p className="mt-2 text-sm text-muted-foreground">Modules are grouped by operational responsibility so onboarding, ownership, and reporting stay clear.</p>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {moduleGroups.map((group) => (
                <article key={group.name} className="rounded-lg border border-border bg-background p-4">
                  <h3 className="font-medium">{group.name}</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {group.modules.map((module) => (
                      <li key={module}>• {module}</li>
                    ))}
                  </ul>
                  {group.badges && group.badges.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-border/30">
                      {group.badges.map((badge) => (
                        <span key={badge} className={`text-xs rounded-md border px-2 py-1 ${badgeColors[badge] || 'bg-border/20 text-foreground'}`}>
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section id="role-flows" className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">Role Flows</h2>
            <RoleFlowsSection />
          </section>

          <section id="implementation-path" className="rounded-lg border border-border bg-card p-5 md:p-6 mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Implementation Path</h2>
            <p className="mt-2 text-sm text-muted-foreground">Recommended rollout path to move from setup to operational maturity.</p>
            <div className="mt-5 space-y-4">
              {implementationPath.map((stage) => (
                <article key={stage.phase} className="rounded-lg border border-border bg-background p-4">
                  <h3 className="font-medium">{stage.phase}</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {stage.tasks.map((task) => (
                      <li key={task}>• {task}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section id="security-compliance" className="rounded-lg border border-border bg-card p-5 md:p-6 mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Security and Compliance</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="rounded-lg border border-border bg-background p-4">
                <h3 className="text-foreground font-medium mb-2">Access and Identity</h3>
                <p>Role-based permissions, scoped dashboard access, and controlled module visibility by responsibility.</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <h3 className="text-foreground font-medium mb-2">Auditability</h3>
                <p>Action trails for governance, settings, and operational records to support internal and regulatory audits.</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <h3 className="text-foreground font-medium mb-2">Operational Controls</h3>
                <p>Escalation workflows, notification channels, and task accountability across staff and management roles.</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <h3 className="text-foreground font-medium mb-2">Documentation Governance</h3>
                <p>Structured storage for compliance documents, renewal records, and approval history.</p>
              </div>
            </div>
          </section>

          <section id="api-access" className="rounded-lg border border-border bg-card p-5 md:p-6">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">API Access</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              API documentation and key management are available through the API Access area for enabled products.
            </p>
            <Link href="/api-access" className="inline-block mt-4 text-sm text-accent hover:underline">Open API Access →</Link>
          </section>

          <section id="faq" className="rounded-lg border border-border bg-card p-5 md:p-6 mt-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">FAQ</h2>
            <div className="mt-4 space-y-3">
              {faqItems.map((item) => (
                <article key={item.q} className="rounded-lg border border-border bg-background p-4">
                  <h3 className="font-medium">{item.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="mt-8 border-t border-border/40 pt-6 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">← Back to Home</Link>
          </div>
        </section>

        <aside className="hidden xl:block">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-4">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">On this page</h2>
            <ul className="space-y-2 text-sm">
              {toc.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={item.href === `#${activeSection}` ? "location" : undefined}
                    className={`block rounded px-2 py-1 transition-colors ${
                      item.href === `#${activeSection}`
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
      </div>
    </main>
  )
}

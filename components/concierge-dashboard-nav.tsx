"use client"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { DEFAULT_STARTER_PLAN, resolveStarterPlan, type StarterPlan } from "@/lib/rollout"

type FeatureScope = "all" | "professional"

type ConciergeFeature = {
  key: string
  label: string
  href: string
  scope: FeatureScope
}

const FEATURE_REGISTRY: Record<string, ConciergeFeature> = {
  announcements: { key: "announcements", label: "Announcements", href: "/concierge/announcements", scope: "all" },
  bulletinBoard: { key: "bulletinBoard", label: "Bulletin Board", href: "/concierge/bulletin-board", scope: "all" },
  units: { key: "units", label: "Units/Occupants", href: "/concierge/units", scope: "all" },
  customFields: { key: "customFields", label: "Custom Fields", href: "/concierge/custom-fields", scope: "all" },
  calendar: { key: "calendar", label: "Calendar", href: "/concierge/calendar", scope: "all" },
  library: { key: "library", label: "Library", href: "/concierge/library", scope: "all" },
  reservation: { key: "reservation", label: "Reservation", href: "/concierge/reservation", scope: "all" },
  petRegistry: { key: "petRegistry", label: "Pet Registry", href: "/concierge/pet-registry", scope: "all" },
  parking: { key: "parking", label: "Parking Management", href: "/concierge/parking", scope: "professional" },
  assets: { key: "assets", label: "Asset Manager", href: "/concierge/assets", scope: "professional" },
  frontdesk: { key: "frontdesk", label: "Front Desk", href: "/concierge/frontdesk", scope: "all" },
  eventLogs: { key: "eventLogs", label: "Event Logs", href: "/concierge/event-logs", scope: "all" },
  instructions: { key: "instructions", label: "Instructions", href: "/concierge/instructions", scope: "all" },
  incidentReport: { key: "incidentReport", label: "Incident Report", href: "/concierge/incident-report", scope: "all" },
  residentDirectory: { key: "residentDirectory", label: "Resident Directory", href: "/concierge/resident-directory", scope: "all" },
  tenantAssignments: { key: "tenantAssignments", label: "Tenant Assignments", href: "/concierge/tenant-assignments", scope: "all" },
  settings: { key: "settings", label: "General Settings", href: "/concierge/settings", scope: "all" },
}

const NAV_SECTIONS = [
  {
    title: "Dashboard",
    featureKeys: ["announcements", "bulletinBoard"],
  },
  {
    title: "Manage",
    featureKeys: ["units", "customFields", "calendar", "library", "reservation", "petRegistry", "parking", "assets"],
  },
  {
    title: "Front Desk",
    featureKeys: ["frontdesk", "eventLogs", "instructions", "incidentReport", "residentDirectory", "tenantAssignments"],
  },
  {
    title: "Settings",
    featureKeys: ["settings"],
  },
]

export function ConciergeDashboardNav() {
  const [plan, setPlan] = useState<StarterPlan>(DEFAULT_STARTER_PLAN)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("buildsync_signup_plan")
      if (!raw) return
      const parsed = JSON.parse(raw) as { plan?: string }
      setPlan(resolveStarterPlan(parsed.plan))
    } catch {
      // Keep default package when stored value is invalid.
    }
  }, [])

  const sections = useMemo(
    () =>
      NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.featureKeys
          .map((key) => FEATURE_REGISTRY[key])
          .filter((item): item is ConciergeFeature => Boolean(item))
          .filter((item) => item.scope === "all" || plan === "professional"),
      })).filter((section) => section.items.length > 0),
    [plan],
  )

  return (
    <nav className="w-full max-w-7xl mx-auto pb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-[var(--font-bebas)] text-3xl tracking-wide">Concierge Modules</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          SaaS Workspace
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((section) => (
          <section key={section.title} className="rounded-xl border border-border/35 bg-card/45 p-4">
            <h3 className="font-[var(--font-bebas)] text-xl tracking-wide mb-3">{section.title}</h3>
            <ul className="space-y-1.5">
              {section.items.map((item) => (
                <li key={`${section.title}-${item.href}`}>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent/10"
                  >
                    <span className="font-mono text-xs text-foreground/90 group-hover:text-accent">{item.label}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground group-hover:text-accent">
                      Open
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  )
}

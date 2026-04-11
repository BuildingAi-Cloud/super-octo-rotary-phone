import Link from "next/link"

const commercialTracks = [
  {
    slug: "office-operations",
    title: "Office Operations",
    summary: "Coordinate engineering, janitorial, and tenant service workflows for office portfolios.",
    points: ["Work order triage", "Tenant service SLAs", "Shift handoff logging"],
  },
  {
    slug: "retail-center-operations",
    title: "Retail Center Operations",
    summary: "Manage common areas, storefront issues, footfall-sensitive maintenance, and vendor turnaround.",
    points: ["Storefront incident response", "Common area readiness", "Vendor dispatch and tracking"],
  },
  {
    slug: "mixed-use-governance",
    title: "Mixed-Use Governance",
    summary: "Align residential, commercial, and shared services under a single operational control model.",
    points: ["Shared asset controls", "Cross-zone compliance", "Role-based approvals"],
  },
  {
    slug: "leasing-and-tenant-experience",
    title: "Leasing and Tenant Experience",
    summary: "Connect leasing pipeline, move-ins, renewals, and daily tenant communications.",
    points: ["Leasing pipeline visibility", "Renewal lifecycle", "Tenant communication threads"],
  },
]

const implementationPhases = [
  {
    name: "Phase 1 - Foundation",
    tasks: ["Map portfolio hierarchy", "Define commercial role scopes", "Import assets and tenant records"],
  },
  {
    name: "Phase 2 - Operations",
    tasks: ["Enable SLA routing", "Configure incident and vendor workflows", "Activate service dashboards"],
  },
  {
    name: "Phase 3 - Performance",
    tasks: ["Track KPIs and breaches", "Run compliance reviews", "Optimize tenant response cycles"],
  },
]

const commercialCtas = [
  {
    title: "Book Demo",
    description: "Walk through commercial workflows with your portfolio use cases.",
    href: "/contact",
    label: "Schedule demo",
  },
  {
    title: "Request Pilot",
    description: "Start with one property and validate operational KPIs before full rollout.",
    href: "/support",
    label: "Request pilot plan",
  },
  {
    title: "Download Sector Brief",
    description: "Get a concise implementation checklist for commercial facilities teams.",
    href: "/docs",
    label: "Open sector brief",
  },
]

export default function CommercialPage() {
  return (
    <main className="min-h-screen py-20 px-4 md:px-8 bg-background">
      <section className="max-w-screen-2xl mx-auto">
        <div className="rounded-2xl border border-border/30 bg-card/30 p-6 md:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-3">Industry Solution</p>
          <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">Commercial Facilities</h1>
          <p className="mt-4 max-w-4xl font-mono text-sm md:text-base text-muted-foreground leading-relaxed">
            BuildSync for commercial portfolios provides one control plane for service delivery, leasing workflows, tenant experience, and compliance readiness. Start with the operational track that matches your portfolio and expand from there.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <Link href="/documentation" className="rounded-lg border border-border/30 bg-background/60 p-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
              Documentation overview
            </Link>
            <Link href="/documentation/product-map/operations-core" className="rounded-lg border border-border/30 bg-background/60 p-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
              Operations Core deep dive
            </Link>
            <Link href="/docs" className="rounded-lg border border-border/30 bg-background/60 p-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
              Explore full docs hub
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-border/30 bg-card/30 p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Commercial Operational Tracks</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Open each track for full how-it-works details</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {commercialTracks.map((track) => (
              <article key={track.slug} className="rounded-xl border border-border/30 bg-background/60 p-5 flex flex-col">
                <h3 className="text-xl font-semibold text-foreground">{track.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{track.summary}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {track.points.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
                <Link href={`/commercial/${track.slug}`} className="mt-4 inline-flex items-center text-sm text-accent hover:underline">
                  Open track details {">"}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-border/30 bg-card/30 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Implementation Path for Commercial Portfolios</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {implementationPhases.map((phase) => (
              <article key={phase.name} className="rounded-xl border border-border/30 bg-background/60 p-4">
                <h3 className="font-medium text-foreground">{phase.name}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {phase.tasks.map((task) => (
                    <li key={task}>• {task}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-accent/30 bg-accent/10 p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-2">Next Action</p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Choose your commercial rollout path</h2>
            </div>
            <Link href="/commercial/office-operations" className="text-sm text-accent hover:underline">
              Start with Office Operations {'->'}
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {commercialCtas.map((cta) => (
              <article key={cta.title} className="rounded-xl border border-accent/30 bg-background/70 p-4 flex flex-col">
                <h3 className="text-lg font-semibold text-foreground">{cta.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{cta.description}</p>
                <Link href={cta.href} className="mt-4 inline-flex items-center text-sm text-accent hover:underline">
                  {cta.label} {'->'}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

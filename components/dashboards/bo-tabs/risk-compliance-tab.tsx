"use client";

import React, { useState } from "react";
import { Icons, SectionCard, KpiCard, HorizontalBar, FilterChip, Badge, StatusIndicator } from "./bo-shared";

type IncidentFilter = "all" | "active" | "resolved";

const insurancePolicies = [
  { type: "Property / All-Risk", provider: "Zurich Commercial", expiry: "Dec 31, 2025", premium: "$128,400/yr", status: "active" as const, coverage: "$45M" },
  { type: "General Liability", provider: "Hartford", expiry: "Jun 30, 2025", premium: "$42,600/yr", status: "active" as const, coverage: "$10M" },
  { type: "Workers\u2019 Compensation", provider: "Travelers", expiry: "Mar 15, 2025", premium: "$18,200/yr", status: "expiring" as const, coverage: "Statutory" },
  { type: "Umbrella / Excess", provider: "Chubb", expiry: "Dec 31, 2025", premium: "$34,800/yr", status: "active" as const, coverage: "$25M" },
  { type: "Cyber Liability", provider: "AIG", expiry: "Sep 30, 2025", premium: "$8,400/yr", status: "active" as const, coverage: "$5M" },
  { type: "Directors & Officers", provider: "CNA", expiry: "Aug 15, 2025", premium: "$12,600/yr", status: "active" as const, coverage: "$5M" },
];

const incidents = [
  { id: "INC-2024-018", title: "Elevator entrapment — Bank East", date: "Mar 12, 2025", severity: "critical" as const, status: "investigating" as const, liability: "$45,000" },
  { id: "INC-2024-017", title: "Water intrusion — Units 302-305", date: "Mar 8, 2025", severity: "high" as const, status: "remediation" as const, liability: "$28,000" },
  { id: "INC-2024-016", title: "Slip & fall — Lobby area", date: "Feb 22, 2025", severity: "medium" as const, status: "claim-filed" as const, liability: "$12,000" },
  { id: "INC-2024-015", title: "Fire alarm malfunction — Floor 8", date: "Feb 10, 2025", severity: "high" as const, status: "resolved" as const, liability: "$3,200" },
  { id: "INC-2024-014", title: "Parking gate injury", date: "Jan 28, 2025", severity: "low" as const, status: "resolved" as const, liability: "$1,800" },
];

const esgMetrics = {
  overall: 72,
  environmental: { score: 68, items: [
    { label: "Energy Efficiency (ENERGY STAR)", value: 74, target: 80 },
    { label: "Water Usage Reduction", value: 62, target: 70 },
    { label: "Waste Diversion Rate", value: 58, target: 75 },
    { label: "Carbon Emissions (Scope 1+2)", value: 71, target: 80 },
  ]},
  social: { score: 78, items: [
    { label: "Tenant Satisfaction", value: 84, target: 85 },
    { label: "Community Engagement", value: 72, target: 75 },
    { label: "Health & Safety Compliance", value: 88, target: 90 },
    { label: "Accessibility Score", value: 65, target: 80 },
  ]},
  governance: { score: 74, items: [
    { label: "Board Diversity", value: 70, target: 75 },
    { label: "Transparency Index", value: 82, target: 85 },
    { label: "Policy Compliance", value: 78, target: 90 },
    { label: "Audit Completeness", value: 68, target: 80 },
  ]},
};

export default function RiskComplianceTab() {
  const [incidentFilter, setIncidentFilter] = useState<IncidentFilter>("all");
  const [esgSection, setEsgSection] = useState<"overview" | "environmental" | "social" | "governance">("overview");

  const filteredIncidents = incidentFilter === "all" ? incidents : incidents.filter((inc) =>
    incidentFilter === "active" ? inc.status !== "resolved" : inc.status === "resolved"
  );

  return (
    <div className="space-y-6">
      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Insurance Status" value="5 Active" change="1 Expiring Soon" positive={false} color="text-green-500" />
        <KpiCard label="Open Incidents" value="3" color="text-red-400" />
        <KpiCard label="Total Liability Exposure" value="$85,000" color="text-yellow-500" />
        <KpiCard label="ESG Score" value={`${esgMetrics.overall}/100`} change="+4 pts YoY" positive color="text-blue-500" />
      </div>

      {/* Insurance & Liability */}
      <SectionCard title="Insurance & Liability Status" actions={<span className="text-muted-foreground">{Icons.download}</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Policy Type</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Provider</th>
                <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Coverage</th>
                <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Premium</th>
                <th className="text-center py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Expiry</th>
                <th className="text-center py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {insurancePolicies.map((p, i) => (
                <tr key={i} className={`border-b border-border/10 hover:bg-accent/5 transition-colors ${p.status === "expiring" ? "bg-red-500/5" : ""}`}>
                  <td className="py-2.5 font-medium">{p.type}</td>
                  <td className="py-2.5 text-muted-foreground">{p.provider}</td>
                  <td className="py-2.5 text-right">{p.coverage}</td>
                  <td className="py-2.5 text-right">{p.premium}</td>
                  <td className="py-2.5 text-center">{p.expiry}</td>
                  <td className="py-2.5 text-center">
                    <StatusIndicator
                      status={p.status === "active" ? "green" : "red"}
                      label={p.status === "active" ? "Active" : "Expiring"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border/20 mt-3">
          <span className="font-mono text-[10px] text-muted-foreground">Total Annual Premium</span>
          <span className="font-[var(--font-bebas)] text-lg text-accent">$245,000</span>
        </div>
      </SectionCard>

      {/* Critical Incident Alerts */}
      <SectionCard
        title="Critical Incident Alerts"
        actions={
          <div className="flex items-center gap-1">
            {(["all", "active", "resolved"] as IncidentFilter[]).map((f) => (
              <FilterChip key={f} label={f} active={incidentFilter === f} onClick={() => setIncidentFilter(f)} />
            ))}
          </div>
        }
      >
        <div className="space-y-2">
          {filteredIncidents.map((inc, i) => {
            const sevColor =
              inc.severity === "critical" ? "border-red-500/40 text-red-500" :
              inc.severity === "high" ? "border-orange-500/40 text-orange-500" :
              inc.severity === "medium" ? "border-yellow-500/40 text-yellow-500" :
              "border-border/40 text-muted-foreground";
            const statusColor =
              inc.status === "resolved" ? "border-green-500/40 text-green-500" :
              inc.status === "claim-filed" ? "border-blue-500/40 text-blue-500" :
              inc.status === "remediation" ? "border-yellow-500/40 text-yellow-500" :
              "border-red-500/40 text-red-500";
            return (
              <div key={i} className={`flex items-center justify-between p-3 border rounded-md ${inc.severity === "critical" ? "border-red-500/30 bg-red-500/5" : "border-border/20"}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    inc.severity === "critical" ? "bg-red-500 animate-pulse" :
                    inc.severity === "high" ? "bg-orange-500" :
                    inc.severity === "medium" ? "bg-yellow-500" : "bg-gray-400"
                  }`} />
                  <div>
                    <p className="font-mono text-xs">{inc.title}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{inc.id} • {inc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">{inc.liability}</span>
                  <Badge className={sevColor}>{inc.severity}</Badge>
                  <Badge className={statusColor}>{inc.status}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ESG Score */}
      <SectionCard
        title="Sustainability & ESG Score"
        actions={
          <div className="flex items-center gap-1">
            {(["overview", "environmental", "social", "governance"] as const).map((s) => (
              <FilterChip key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} active={esgSection === s} onClick={() => setEsgSection(s)} />
            ))}
          </div>
        }
      >
        {esgSection === "overview" ? (
          <div className="grid md:grid-cols-3 gap-6">
            {([
              { label: "Environmental", score: esgMetrics.environmental.score, color: "text-green-500" },
              { label: "Social", score: esgMetrics.social.score, color: "text-blue-500" },
              { label: "Governance", score: esgMetrics.governance.score, color: "text-purple-500" },
            ]).map((pillar, i) => (
              <div key={i} className="text-center p-6 border border-border/20 rounded-lg">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{pillar.label}</p>
                <p className={`text-4xl font-[var(--font-bebas)] mt-2 ${pillar.color}`}>{pillar.score}</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">/ 100</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {esgMetrics[esgSection].items.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px]">{item.label}</span>
                  <span className={`font-mono text-[10px] ${item.value >= item.target ? "text-green-500" : "text-yellow-500"}`}>
                    {item.value} / {item.target}
                  </span>
                </div>
                <div className="relative h-2 w-full bg-border/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.value >= item.target ? "bg-green-500/60" : item.value >= item.target * 0.85 ? "bg-yellow-500/60" : "bg-red-500/60"}`}
                    style={{ width: `${item.value}%` }}
                  />
                  <div className="absolute inset-y-0 w-0.5 bg-foreground/30" style={{ left: `${item.target}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

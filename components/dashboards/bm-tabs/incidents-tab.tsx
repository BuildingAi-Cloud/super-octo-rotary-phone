"use client";

import React, { useState } from "react";
import { Icons, Badge, FilterBar, FilterChip, SearchInput, SectionCard, EmptyState } from "./bm-shared";

type IncidentFilter = "all" | "open" | "investigating" | "resolved" | "escalated";

interface Incident {
  id: string;
  title: string;
  type: "accident" | "noise" | "property-damage" | "theft" | "fire" | "flood" | "other";
  location: string;
  reportedBy: string;
  reportedAt: string;
  status: "open" | "investigating" | "resolved" | "escalated";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  hasPhotos: boolean;
  insuranceClaim: boolean;
  assignedTo: string;
}

const INCIDENTS: Incident[] = [
  { id: "INC-001", title: "Water damage from burst pipe - Unit 7A", type: "flood", location: "Unit 7A / 8A", reportedBy: "Marcus Johnson", reportedAt: "2025-01-14 06:45", status: "investigating", severity: "critical", description: "Water from 8A burst pipe leaked into 7A ceiling. Drywall damage, carpet soaked.", hasPhotos: true, insuranceClaim: true, assignedTo: "Claims Dept" },
  { id: "INC-002", title: "Noise complaint - Unit 22C loud party", type: "noise", location: "Unit 22C", reportedBy: "Unit 21C Resident", reportedAt: "2025-01-13 23:30", status: "resolved", severity: "low", description: "Excessive noise past 11 PM quiet hours. Verbal warning issued.", hasPhotos: false, insuranceClaim: false, assignedTo: "Security" },
  { id: "INC-003", title: "Lobby glass door cracked", type: "property-damage", location: "Main Lobby", reportedBy: "Concierge", reportedAt: "2025-01-13 15:00", status: "open", severity: "medium", description: "Hairline crack in lobby entrance glass door. Appears to have been struck by delivery cart.", hasPhotos: true, insuranceClaim: false, assignedTo: "Mike Reynolds" },
  { id: "INC-004", title: "Slip and fall in parking garage", type: "accident", location: "Garage Level B1", reportedBy: "Security Camera", reportedAt: "2025-01-12 19:20", status: "escalated", severity: "high", description: "Resident slipped on wet floor in garage. Minor injury reported. Area was not marked.", hasPhotos: true, insuranceClaim: true, assignedTo: "Legal / Claims" },
  { id: "INC-005", title: "Bicycle stolen from storage room", type: "theft", location: "Bike Storage B2", reportedBy: "David Kim", reportedAt: "2025-01-11 08:00", status: "investigating", severity: "medium", description: "Resident reports mountain bike missing. Lock appears to have been cut. Police report filed.", hasPhotos: true, insuranceClaim: false, assignedTo: "Security" },
  { id: "INC-006", title: "Fire alarm triggered - burnt food", type: "fire", location: "Unit 3D", reportedBy: "Fire Panel", reportedAt: "2025-01-10 12:15", status: "resolved", severity: "low", description: "False alarm triggered by cooking smoke. Fire dept responded and cleared.", hasPhotos: false, insuranceClaim: false, assignedTo: "Building Manager" },
];

export default function IncidentsTab() {
  const [filter, setFilter] = useState<IncidentFilter>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = INCIDENTS.filter((inc) => {
    if (filter !== "all" && inc.status !== filter) return false;
    return (
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.location.toLowerCase().includes(search.toLowerCase()) ||
      inc.type.toLowerCase().includes(search.toLowerCase()) ||
      inc.reportedBy.toLowerCase().includes(search.toLowerCase())
    );
  });

  const stats = {
    open: INCIDENTS.filter((i) => i.status === "open").length,
    investigating: INCIDENTS.filter((i) => i.status === "investigating").length,
    escalated: INCIDENTS.filter((i) => i.status === "escalated").length,
    resolved: INCIDENTS.filter((i) => i.status === "resolved").length,
    claims: INCIDENTS.filter((i) => i.insuranceClaim).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Open", value: stats.open, color: "text-accent" },
          { label: "Investigating", value: stats.investigating, color: "text-blue-500" },
          { label: "Escalated", value: stats.escalated, color: "text-red-500" },
          { label: "Resolved", value: stats.resolved, color: "text-green-500" },
          { label: "Insurance Claims", value: stats.claims, color: "text-yellow-500" },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <FilterBar>
        {(["all", "open", "investigating", "resolved", "escalated"] as IncidentFilter[]).map((f) => (
          <FilterChip key={f} label={f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
        ))}
        <SearchInput value={search} onChange={setSearch} placeholder="Search incidents..." />
      </FilterBar>

      <SectionCard
        title="Incident Reports"
        actions={
          <button type="button" className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-accent/40 text-accent hover:bg-accent/10 rounded-md transition-colors">
            {Icons.plus} File Report
          </button>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState message="No incidents found" />
        ) : (
          <div className="space-y-2">
            {filtered.map((inc) => (
              <div key={inc.id} className="border border-border/20 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-card/50 transition-colors text-left"
                >
                  <span className="text-xs font-mono text-accent w-16">{inc.id}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium truncate">{inc.title}</span>
                      {inc.hasPhotos && <Badge className="border-blue-500/40 text-blue-500">📷</Badge>}
                      {inc.insuranceClaim && <Badge className="border-yellow-500/40 text-yellow-500">claim</Badge>}
                    </div>
                  </div>
                  <Badge className="border-border/40 text-muted-foreground">{inc.type}</Badge>
                  <Badge className={
                    inc.severity === "critical" ? "border-red-500/40 text-red-500" :
                    inc.severity === "high" ? "border-orange-500/40 text-orange-500" :
                    inc.severity === "medium" ? "border-yellow-500/40 text-yellow-500" :
                    "border-green-500/40 text-green-500"
                  }>
                    {inc.severity}
                  </Badge>
                  <Badge className={
                    inc.status === "open" ? "border-blue-500/40 text-blue-500" :
                    inc.status === "investigating" ? "border-accent/40 text-accent" :
                    inc.status === "escalated" ? "border-red-500/40 text-red-500" :
                    "border-green-500/40 text-green-500"
                  }>
                    {inc.status}
                  </Badge>
                </button>

                {expanded === inc.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-border/20 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Location</span>
                        <p className="mt-0.5">{inc.location}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Reported By</span>
                        <p className="mt-0.5">{inc.reportedBy}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Reported At</span>
                        <p className="mt-0.5">{inc.reportedAt}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Assigned To</span>
                        <p className="mt-0.5">{inc.assignedTo}</p>
                      </div>
                    </div>
                    <div className="text-xs font-mono">
                      <span className="text-[10px] uppercase text-muted-foreground">Description</span>
                      <p className="mt-0.5 text-muted-foreground">{inc.description}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

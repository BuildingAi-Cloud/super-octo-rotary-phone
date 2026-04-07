"use client";

import React, { useState } from "react";
import { Icons, Badge, FilterBar, FilterChip, SearchInput, SectionCard, EmptyState } from "./bm-shared";

type VisitorFilter = "all" | "checked-in" | "expected" | "checked-out" | "denied";

interface Visitor {
  id: string;
  name: string;
  type: "guest" | "contractor" | "delivery" | "realtor";
  host: string;
  hostUnit: string;
  purpose: string;
  scheduledAt: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: "checked-in" | "expected" | "checked-out" | "denied";
  vehiclePlate: string | null;
  idVerified: boolean;
}

const VISITORS: Visitor[] = [
  { id: "v1", name: "Robert Smith", type: "guest", host: "Sarah Chen", hostUnit: "14B", purpose: "Dinner guest", scheduledAt: "2025-01-14 18:00", checkInTime: "2025-01-14 18:05", checkOutTime: null, status: "checked-in", vehiclePlate: "ABC-1234", idVerified: true },
  { id: "v2", name: "PlumbRight Inc.", type: "contractor", host: "Building Management", hostUnit: "Common", purpose: "Plumbing repair - Unit 8A", scheduledAt: "2025-01-14 09:00", checkInTime: "2025-01-14 09:10", checkOutTime: "2025-01-14 12:30", status: "checked-out", vehiclePlate: "PRB-5678", idVerified: true },
  { id: "v3", name: "Amazon Fresh", type: "delivery", host: "Marcus Johnson", hostUnit: "8A", purpose: "Grocery delivery", scheduledAt: "2025-01-14 14:00", checkInTime: "2025-01-14 13:55", checkOutTime: "2025-01-14 14:05", status: "checked-out", vehiclePlate: null, idVerified: false },
  { id: "v4", name: "Jennifer Lee", type: "realtor", host: "Property Mgmt", hostUnit: "Unit 7C", purpose: "Unit showing", scheduledAt: "2025-01-15 10:00", checkInTime: null, checkOutTime: null, status: "expected", vehiclePlate: null, idVerified: false },
  { id: "v5", name: "Maria Garcia", type: "guest", host: "Emily Park", hostUnit: "22C", purpose: "Weekend stay", scheduledAt: "2025-01-15 16:00", checkInTime: null, checkOutTime: null, status: "expected", vehiclePlate: "XYZ-9012", idVerified: false },
  { id: "v6", name: "Unknown individual", type: "guest", host: "N/A", hostUnit: "N/A", purpose: "Unregistered", scheduledAt: "2025-01-14 15:30", checkInTime: null, checkOutTime: null, status: "denied", vehiclePlate: null, idVerified: false },
  { id: "v7", name: "HVAC Solutions", type: "contractor", host: "Building Management", hostUnit: "Mechanical", purpose: "HVAC quarterly service", scheduledAt: "2025-01-15 08:00", checkInTime: null, checkOutTime: null, status: "expected", vehiclePlate: "HVS-3456", idVerified: false },
];

export default function VisitorsTab() {
  const [filter, setFilter] = useState<VisitorFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = VISITORS.filter((v) => {
    if (filter !== "all" && v.status !== filter) return false;
    return (
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.host.toLowerCase().includes(search.toLowerCase()) ||
      v.hostUnit.toLowerCase().includes(search.toLowerCase()) ||
      v.purpose.toLowerCase().includes(search.toLowerCase())
    );
  });

  const stats = {
    onSite: VISITORS.filter((v) => v.status === "checked-in").length,
    expected: VISITORS.filter((v) => v.status === "expected").length,
    checkedOut: VISITORS.filter((v) => v.status === "checked-out").length,
    denied: VISITORS.filter((v) => v.status === "denied").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "On-Site Now", value: stats.onSite, color: "text-green-500" },
          { label: "Expected Today", value: stats.expected, color: "text-blue-500" },
          { label: "Checked Out", value: stats.checkedOut, color: "text-muted-foreground" },
          { label: "Denied", value: stats.denied, color: "text-red-500" },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <FilterBar>
        {(["all", "checked-in", "expected", "checked-out", "denied"] as VisitorFilter[]).map((f) => (
          <FilterChip key={f} label={f === "all" ? "All" : f === "checked-in" ? "On-Site" : f === "checked-out" ? "Left" : f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
        ))}
        <SearchInput value={search} onChange={setSearch} placeholder="Search visitors..." />
      </FilterBar>

      <SectionCard
        title="Visitor Log"
        actions={
          <button type="button" className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-accent/40 text-accent hover:bg-accent/10 rounded-md transition-colors">
            {Icons.plus} Register Guest
          </button>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState message="No visitors found" />
        ) : (
          <div className="space-y-2">
            {filtered.map((v) => (
              <div key={v.id} className="flex items-center gap-4 p-3 border border-border/20 rounded-md hover:bg-card/50 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border text-xs font-mono ${
                  v.type === "guest" ? "bg-blue-500/10 border-blue-500/30 text-blue-500" :
                  v.type === "contractor" ? "bg-orange-500/10 border-orange-500/30 text-orange-500" :
                  v.type === "delivery" ? "bg-green-500/10 border-green-500/30 text-green-500" :
                  "bg-purple-500/10 border-purple-500/30 text-purple-500"
                }`}>
                  {v.type.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{v.name}</span>
                    <Badge className="border-border/40 text-muted-foreground">{v.type}</Badge>
                    {v.idVerified && <Badge className="border-green-500/40 text-green-500">ID ✓</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    Host: {v.host} · {v.hostUnit} · {v.purpose}
                  </p>
                </div>
                {v.vehiclePlate && <span className="text-xs font-mono text-muted-foreground bg-card/50 px-2 py-0.5 rounded border border-border/20">{v.vehiclePlate}</span>}
                <div className="text-right">
                  <Badge className={
                    v.status === "checked-in" ? "border-green-500/40 text-green-500" :
                    v.status === "expected" ? "border-blue-500/40 text-blue-500" :
                    v.status === "checked-out" ? "border-gray-400/40 text-gray-400" :
                    "border-red-500/40 text-red-500"
                  }>
                    {v.status}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {v.checkInTime ? v.checkInTime.split(" ")[1] : v.scheduledAt.split(" ")[1]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

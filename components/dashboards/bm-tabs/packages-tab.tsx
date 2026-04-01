"use client";

import React, { useState } from "react";
import { Icons, Badge, FilterBar, FilterChip, SearchInput, SectionCard, EmptyState } from "./bm-shared";

type PkgFilter = "all" | "pending" | "notified" | "collected" | "overdue";

interface Package {
  id: string;
  trackingNumber: string;
  carrier: string;
  resident: string;
  unit: string;
  receivedAt: string;
  lockerNumber: string | null;
  status: "pending" | "notified" | "collected" | "overdue";
  collectedAt: string | null;
  size: "small" | "medium" | "large" | "oversized";
}

const PACKAGES: Package[] = [
  { id: "p1", trackingNumber: "1Z999AA10123456784", carrier: "UPS", resident: "Sarah Chen", unit: "14B", receivedAt: "2025-01-14 10:30", lockerNumber: "L-12", status: "notified", collectedAt: null, size: "medium" },
  { id: "p2", trackingNumber: "9405511899223100012", carrier: "USPS", resident: "Marcus Johnson", unit: "8A", receivedAt: "2025-01-14 09:15", lockerNumber: "L-03", status: "pending", collectedAt: null, size: "small" },
  { id: "p3", trackingNumber: "794644790132", carrier: "FedEx", resident: "Emily Park", unit: "22C", receivedAt: "2025-01-13 14:00", lockerNumber: null, status: "overdue", collectedAt: null, size: "oversized" },
  { id: "p4", trackingNumber: "1Z999AA10123456799", carrier: "UPS", resident: "David Kim", unit: "3D", receivedAt: "2025-01-13 11:00", lockerNumber: "L-07", status: "collected", collectedAt: "2025-01-13 18:30", size: "small" },
  { id: "p5", trackingNumber: "TBA123456789012", carrier: "Amazon", resident: "Lisa Wang", unit: "22D", receivedAt: "2025-01-14 11:45", lockerNumber: "L-15", status: "notified", collectedAt: null, size: "medium" },
  { id: "p6", trackingNumber: "794644790145", carrier: "FedEx", resident: "Jake Miller", unit: "7C", receivedAt: "2025-01-12 08:30", lockerNumber: "L-01", status: "overdue", collectedAt: null, size: "large" },
  { id: "p7", trackingNumber: "9405511899223100045", carrier: "USPS", resident: "Amy Torres", unit: "15A", receivedAt: "2025-01-14 12:00", lockerNumber: "L-20", status: "pending", collectedAt: null, size: "small" },
  { id: "p8", trackingNumber: "1Z999AA10123456810", carrier: "UPS", resident: "Oscar Reyes", unit: "3B", receivedAt: "2025-01-11 16:00", lockerNumber: "L-09", status: "collected", collectedAt: "2025-01-12 10:00", size: "medium" },
];

export default function PackagesTab() {
  const [filter, setFilter] = useState<PkgFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = PACKAGES.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    return (
      p.resident.toLowerCase().includes(search.toLowerCase()) ||
      p.unit.toLowerCase().includes(search.toLowerCase()) ||
      p.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.carrier.toLowerCase().includes(search.toLowerCase())
    );
  });

  const stats = {
    total: PACKAGES.length,
    pending: PACKAGES.filter((p) => p.status === "pending").length,
    notified: PACKAGES.filter((p) => p.status === "notified").length,
    overdue: PACKAGES.filter((p) => p.status === "overdue").length,
    collected: PACKAGES.filter((p) => p.status === "collected").length,
  };

  const lockerOccupancy = PACKAGES.filter((p) => p.lockerNumber && p.status !== "collected").length;
  const totalLockers = 24;

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Today", value: stats.total, color: "text-accent" },
          { label: "Pending Scan", value: stats.pending, color: "text-blue-500" },
          { label: "Notified", value: stats.notified, color: "text-green-500" },
          { label: "Overdue", value: stats.overdue, color: "text-red-500" },
          { label: "Locker Usage", value: `${lockerOccupancy}/${totalLockers}`, color: "text-muted-foreground" },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <FilterBar>
        {(["all", "pending", "notified", "collected", "overdue"] as PkgFilter[]).map((f) => (
          <FilterChip key={f} label={f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
        ))}
        <SearchInput value={search} onChange={setSearch} placeholder="Search packages..." />
      </FilterBar>

      <SectionCard
        title="Package Log"
        actions={
          <button type="button" className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-accent/40 text-accent hover:bg-accent/10 rounded-md transition-colors">
            {Icons.plus} Scan New
          </button>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState message="No packages found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border/20 text-muted-foreground uppercase tracking-wider">
                  <th className="text-left py-2 px-2">Tracking</th>
                  <th className="text-left py-2 px-2">Carrier</th>
                  <th className="text-left py-2 px-2">Resident</th>
                  <th className="text-left py-2 px-2">Unit</th>
                  <th className="text-left py-2 px-2">Locker</th>
                  <th className="text-left py-2 px-2">Size</th>
                  <th className="text-left py-2 px-2">Received</th>
                  <th className="text-left py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/10 hover:bg-card/50 transition-colors">
                    <td className="py-2.5 px-2 text-accent">{p.trackingNumber.slice(-8)}</td>
                    <td className="py-2.5 px-2">{p.carrier}</td>
                    <td className="py-2.5 px-2">{p.resident}</td>
                    <td className="py-2.5 px-2">{p.unit}</td>
                    <td className="py-2.5 px-2">{p.lockerNumber || "—"}</td>
                    <td className="py-2.5 px-2">
                      <Badge className={p.size === "oversized" ? "border-red-500/40 text-red-500" : "border-border/40 text-muted-foreground"}>
                        {p.size}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-2 text-muted-foreground">{p.receivedAt.split(" ")[1]}</td>
                    <td className="py-2.5 px-2">
                      <Badge className={
                        p.status === "collected" ? "border-green-500/40 text-green-500" :
                        p.status === "notified" ? "border-blue-500/40 text-blue-500" :
                        p.status === "overdue" ? "border-red-500/40 text-red-500" :
                        "border-yellow-500/40 text-yellow-500"
                      }>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

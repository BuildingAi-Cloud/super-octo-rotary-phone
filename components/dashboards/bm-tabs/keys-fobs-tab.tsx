"use client";

import React, { useState } from "react";
import { Icons, Badge, FilterBar, FilterChip, SearchInput, SectionCard, StatusDot, EmptyState } from "./bm-shared";

type KeyFilter = "all" | "assigned" | "available" | "lost" | "deactivated";
type KeyType = "master" | "unit" | "fob" | "garage" | "mailbox";

interface KeyRecord {
  id: string;
  serialNumber: string;
  type: KeyType;
  label: string;
  assignedTo: string | null;
  unit: string | null;
  issuedDate: string | null;
  status: "assigned" | "available" | "lost" | "deactivated";
  lastActivity: string | null;
}

const KEYS: KeyRecord[] = [
  { id: "k1", serialNumber: "KEY-001-M", type: "master", label: "Master Key A", assignedTo: "Building Manager", unit: null, issuedDate: "2024-01-01", status: "assigned", lastActivity: "2025-01-14 08:00" },
  { id: "k2", serialNumber: "KEY-014B-U", type: "unit", label: "Unit 14B Key", assignedTo: "Sarah Chen", unit: "14B", issuedDate: "2024-06-15", status: "assigned", lastActivity: "2025-01-14 07:30" },
  { id: "k3", serialNumber: "FOB-008A", type: "fob", label: "Fob #8A", assignedTo: "Marcus Johnson", unit: "8A", issuedDate: "2024-03-10", status: "assigned", lastActivity: "2025-01-14 09:45" },
  { id: "k4", serialNumber: "GAR-022C", type: "garage", label: "Garage Remote 22C", assignedTo: "Emily Park", unit: "22C", issuedDate: "2024-08-20", status: "assigned", lastActivity: "2025-01-13 22:15" },
  { id: "k5", serialNumber: "KEY-007C-U", type: "unit", label: "Unit 7C Key (Spare)", assignedTo: null, unit: "7C", issuedDate: null, status: "available", lastActivity: null },
  { id: "k6", serialNumber: "FOB-003D", type: "fob", label: "Fob #3D", assignedTo: "David Kim", unit: "3D", issuedDate: "2024-05-01", status: "lost", lastActivity: "2025-01-10 14:00" },
  { id: "k7", serialNumber: "MBX-015A", type: "mailbox", label: "Mailbox Key 15A", assignedTo: "Amy Torres", unit: "15A", issuedDate: "2025-01-10", status: "assigned", lastActivity: "2025-01-14 11:00" },
  { id: "k8", serialNumber: "FOB-OLD-12", type: "fob", label: "Fob #Old-12", assignedTo: null, unit: null, issuedDate: "2022-01-15", status: "deactivated", lastActivity: "2024-06-01 09:00" },
  { id: "k9", serialNumber: "GAR-SPARE-1", type: "garage", label: "Garage Remote Spare", assignedTo: null, unit: null, issuedDate: null, status: "available", lastActivity: null },
  { id: "k10", serialNumber: "KEY-022D-U", type: "unit", label: "Unit 22D Key", assignedTo: "Lisa Wang", unit: "22D", issuedDate: "2024-12-01", status: "assigned", lastActivity: "2025-01-14 08:20" },
];

export default function KeysFobsTab() {
  const [filter, setFilter] = useState<KeyFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = KEYS.filter((k) => {
    if (filter !== "all" && k.status !== filter) return false;
    return (
      k.label.toLowerCase().includes(search.toLowerCase()) ||
      k.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      (k.assignedTo || "").toLowerCase().includes(search.toLowerCase()) ||
      (k.unit || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const stats = {
    total: KEYS.length,
    assigned: KEYS.filter((k) => k.status === "assigned").length,
    available: KEYS.filter((k) => k.status === "available").length,
    lost: KEYS.filter((k) => k.status === "lost").length,
    deactivated: KEYS.filter((k) => k.status === "deactivated").length,
  };

  const byType = (type: KeyType) => KEYS.filter((k) => k.type === type).length;

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Keys/Fobs", value: stats.total, color: "text-accent" },
          { label: "Assigned", value: stats.assigned, color: "text-green-500" },
          { label: "Available", value: stats.available, color: "text-blue-500" },
          { label: "Lost", value: stats.lost, color: "text-red-500" },
          { label: "Deactivated", value: stats.deactivated, color: "text-muted-foreground" },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Type breakdown */}
      <div className="grid grid-cols-5 gap-2">
        {(["master", "unit", "fob", "garage", "mailbox"] as KeyType[]).map((t) => (
          <div key={t} className="border border-border/30 rounded-md p-2 text-center bg-card/20">
            <p className="text-lg font-[var(--font-bebas)] tracking-wide">{byType(t)}</p>
            <p className="text-[9px] font-mono uppercase text-muted-foreground">{t}</p>
          </div>
        ))}
      </div>

      <FilterBar>
        {(["all", "assigned", "available", "lost", "deactivated"] as KeyFilter[]).map((f) => (
          <FilterChip key={f} label={f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
        ))}
        <SearchInput value={search} onChange={setSearch} placeholder="Search keys/fobs..." />
      </FilterBar>

      <SectionCard
        title="Key & Fob Inventory"
        actions={
          <button type="button" className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-accent/40 text-accent hover:bg-accent/10 rounded-md transition-colors">
            {Icons.plus} Issue Key
          </button>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState message="No keys or fobs found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border/20 text-muted-foreground uppercase tracking-wider">
                  <th className="text-left py-2 px-2">Serial</th>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-left py-2 px-2">Label</th>
                  <th className="text-left py-2 px-2">Assigned To</th>
                  <th className="text-left py-2 px-2">Unit</th>
                  <th className="text-left py-2 px-2">Issued</th>
                  <th className="text-left py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((k) => (
                  <tr key={k.id} className="border-b border-border/10 hover:bg-card/50 transition-colors">
                    <td className="py-2.5 px-2 text-accent">{k.serialNumber}</td>
                    <td className="py-2.5 px-2">
                      <Badge className="border-border/40 text-muted-foreground">{k.type}</Badge>
                    </td>
                    <td className="py-2.5 px-2">{k.label}</td>
                    <td className="py-2.5 px-2">{k.assignedTo || "—"}</td>
                    <td className="py-2.5 px-2">{k.unit || "—"}</td>
                    <td className="py-2.5 px-2 text-muted-foreground">{k.issuedDate || "—"}</td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-1.5">
                        <StatusDot status={
                          k.status === "assigned" ? "green" :
                          k.status === "available" ? "yellow" :
                          k.status === "lost" ? "red" : "gray"
                        } />
                        <span>{k.status}</span>
                      </div>
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

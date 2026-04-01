"use client";

import React, { useState } from "react";
import { Icons, Badge, FilterBar, FilterChip, SearchInput, SectionCard, StatusDot, EmptyState } from "./bm-shared";

type ViolationFilter = "all" | "open" | "warning" | "fined" | "paid" | "appealed";

interface Violation {
  id: string;
  unit: string;
  resident: string;
  type: "parking" | "noise" | "pet" | "trash" | "unauthorized-alteration" | "common-area" | "other";
  description: string;
  issuedAt: string;
  status: "open" | "warning" | "fined" | "paid" | "appealed";
  fineAmount: number | null;
  paidAmount: number | null;
  dueDate: string | null;
  notes: string;
}

const VIOLATIONS: Violation[] = [
  { id: "VIO-001", unit: "22C", resident: "Emily Park", type: "noise", description: "Excessive noise after 11 PM — 3rd occurrence", issuedAt: "2025-01-14", status: "fined", fineAmount: 200, paidAmount: null, dueDate: "2025-01-28", notes: "Verbal warnings given on Jan 2 and Jan 8." },
  { id: "VIO-002", unit: "3D", resident: "David Kim", type: "parking", description: "Unauthorized vehicle in reserved spot P-14", issuedAt: "2025-01-13", status: "warning", fineAmount: null, paidAmount: null, dueDate: null, notes: "First offense. Verbal warning issued." },
  { id: "VIO-003", unit: "8A", resident: "Marcus Johnson", type: "pet", description: "Dog off-leash in lobby area", issuedAt: "2025-01-10", status: "fined", fineAmount: 150, paidAmount: 150, dueDate: "2025-01-24", notes: "" },
  { id: "VIO-004", unit: "15A", resident: "Amy Torres", type: "trash", description: "Garbage left in hallway outside unit", issuedAt: "2025-01-12", status: "open", fineAmount: null, paidAmount: null, dueDate: null, notes: "First report. Investigating." },
  { id: "VIO-005", unit: "7C", resident: "Jake Miller", type: "unauthorized-alteration", description: "Installed satellite dish on balcony without approval", issuedAt: "2025-01-08", status: "appealed", fineAmount: 500, paidAmount: null, dueDate: "2025-02-08", notes: "Resident claims they had verbal approval. Under review." },
  { id: "VIO-006", unit: "14B", resident: "Sarah Chen", type: "common-area", description: "Personal items stored in common hallway", issuedAt: "2025-01-11", status: "paid", fineAmount: 75, paidAmount: 75, dueDate: "2025-01-25", notes: "Items removed same day. Fine paid." },
  { id: "VIO-007", unit: "22D", resident: "Lisa Wang", type: "noise", description: "Music during quiet hours", issuedAt: "2025-01-13", status: "warning", fineAmount: null, paidAmount: null, dueDate: null, notes: "First offense." },
];

export default function ViolationsTab() {
  const [filter, setFilter] = useState<ViolationFilter>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = VIOLATIONS.filter((v) => {
    if (filter !== "all" && v.status !== filter) return false;
    return (
      v.resident.toLowerCase().includes(search.toLowerCase()) ||
      v.unit.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  const stats = {
    total: VIOLATIONS.length,
    open: VIOLATIONS.filter((v) => v.status === "open" || v.status === "warning").length,
    fined: VIOLATIONS.filter((v) => v.status === "fined").length,
    paid: VIOLATIONS.filter((v) => v.status === "paid" || (v.paidAmount && v.paidAmount > 0)).length,
    outstanding: VIOLATIONS.filter((v) => v.fineAmount && !v.paidAmount).reduce((sum, v) => sum + (v.fineAmount || 0), 0),
    collected: VIOLATIONS.reduce((sum, v) => sum + (v.paidAmount || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Violations", value: stats.total, color: "text-accent" },
          { label: "Open / Warning", value: stats.open, color: "text-yellow-500" },
          { label: "Fined", value: stats.fined, color: "text-red-500" },
          { label: "Outstanding", value: `$${stats.outstanding}`, color: "text-orange-500" },
          { label: "Collected", value: `$${stats.collected}`, color: "text-green-500" },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <FilterBar>
        {(["all", "open", "warning", "fined", "paid", "appealed"] as ViolationFilter[]).map((f) => (
          <FilterChip key={f} label={f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
        ))}
        <SearchInput value={search} onChange={setSearch} placeholder="Search violations..." />
      </FilterBar>

      <SectionCard
        title="Violations & Fines"
        actions={
          <button type="button" className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-accent/40 text-accent hover:bg-accent/10 rounded-md transition-colors">
            {Icons.plus} Issue Violation
          </button>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState message="No violations found" />
        ) : (
          <div className="space-y-2">
            {filtered.map((v) => (
              <div key={v.id} className="border border-border/20 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-card/50 transition-colors text-left"
                >
                  <span className="text-xs font-mono text-accent w-16">{v.id}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium truncate">{v.description}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{v.resident} · Unit {v.unit}</p>
                  </div>
                  <Badge className="border-border/40 text-muted-foreground">{v.type}</Badge>
                  {v.fineAmount && (
                    <span className="text-xs font-mono font-medium">${v.fineAmount}</span>
                  )}
                  <Badge className={
                    v.status === "paid" ? "border-green-500/40 text-green-500" :
                    v.status === "fined" ? "border-red-500/40 text-red-500" :
                    v.status === "appealed" ? "border-purple-500/40 text-purple-500" :
                    v.status === "warning" ? "border-yellow-500/40 text-yellow-500" :
                    "border-blue-500/40 text-blue-500"
                  }>
                    {v.status}
                  </Badge>
                </button>

                {expanded === v.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-border/20 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Issued</span>
                        <p className="mt-0.5">{v.issuedAt}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Due Date</span>
                        <p className="mt-0.5">{v.dueDate || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Fine</span>
                        <p className="mt-0.5">{v.fineAmount ? `$${v.fineAmount}` : "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Paid</span>
                        <p className={`mt-0.5 ${v.paidAmount ? "text-green-500" : ""}`}>{v.paidAmount ? `$${v.paidAmount}` : "—"}</p>
                      </div>
                    </div>
                    {v.notes && (
                      <div className="text-xs font-mono">
                        <span className="text-[10px] uppercase text-muted-foreground">Notes</span>
                        <p className="mt-0.5 text-muted-foreground">{v.notes}</p>
                      </div>
                    )}
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

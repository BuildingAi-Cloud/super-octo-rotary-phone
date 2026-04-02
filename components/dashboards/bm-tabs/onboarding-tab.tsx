"use client";

import React, { useState } from "react";
import { Icons, Badge, FilterBar, FilterChip, SearchInput, SectionCard, StatusDot, EmptyState } from "./bm-shared";

type OnboardFilter = "all" | "move-in" | "move-out" | "pending" | "completed";

interface MoveRecord {
  id: string;
  resident: string;
  unit: string;
  type: "move-in" | "move-out";
  date: string;
  status: "pending" | "in-progress" | "completed";
  checklist: { task: string; done: boolean }[];
  elevatorBooked: boolean;
  keysHandedOver: boolean;
  depositStatus: string;
}

const MOVE_RECORDS: MoveRecord[] = [
  {
    id: "m1", resident: "Amy Torres", unit: "15A", type: "move-in", date: "2025-01-18", status: "in-progress",
    checklist: [
      { task: "Lease signed", done: true },
      { task: "First month paid", done: true },
      { task: "Welcome package sent", done: true },
      { task: "Unit inspection", done: false },
      { task: "Key handover", done: false },
      { task: "Parking assigned", done: true },
    ],
    elevatorBooked: true, keysHandedOver: false, depositStatus: "Received",
  },
  {
    id: "m2", resident: "Jake Miller", unit: "7C", type: "move-out", date: "2025-01-20", status: "pending",
    checklist: [
      { task: "30-day notice received", done: true },
      { task: "Unit walkthrough scheduled", done: false },
      { task: "Key return", done: false },
      { task: "Deposit reconciliation", done: false },
      { task: "Forwarding address collected", done: false },
    ],
    elevatorBooked: false, keysHandedOver: false, depositStatus: "Held — $2,400",
  },
  {
    id: "m3", resident: "Lisa Wang", unit: "22D", type: "move-in", date: "2025-01-22", status: "pending",
    checklist: [
      { task: "Lease signed", done: true },
      { task: "First month paid", done: false },
      { task: "Welcome package sent", done: false },
      { task: "Unit inspection", done: false },
      { task: "Key handover", done: false },
    ],
    elevatorBooked: false, keysHandedOver: false, depositStatus: "Pending",
  },
  {
    id: "m4", resident: "Oscar Reyes", unit: "3B", type: "move-out", date: "2025-01-10", status: "completed",
    checklist: [
      { task: "30-day notice received", done: true },
      { task: "Unit walkthrough completed", done: true },
      { task: "Key returned", done: true },
      { task: "Deposit refunded", done: true },
      { task: "Forwarding address collected", done: true },
    ],
    elevatorBooked: true, keysHandedOver: true, depositStatus: "Refunded — $1,800",
  },
];

export default function OnboardingTab() {
  const [filter, setFilter] = useState<OnboardFilter>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  // The queue is filtered in two passes: first by move/workflow state, then by
  // resident or unit search so operations staff can narrow quickly.
  const filtered = MOVE_RECORDS.filter((r) => {
    if (filter === "move-in") return r.type === "move-in";
    if (filter === "move-out") return r.type === "move-out";
    if (filter === "pending") return r.status === "pending" || r.status === "in-progress";
    if (filter === "completed") return r.status === "completed";
    return true;
  }).filter((r) => r.resident.toLowerCase().includes(search.toLowerCase()) || r.unit.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    upcoming: MOVE_RECORDS.filter((r) => r.status !== "completed").length,
    moveIns: MOVE_RECORDS.filter((r) => r.type === "move-in").length,
    moveOuts: MOVE_RECORDS.filter((r) => r.type === "move-out").length,
    completed: MOVE_RECORDS.filter((r) => r.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Moves", value: stats.upcoming, color: "text-accent" },
          { label: "Move-Ins", value: stats.moveIns, color: "text-green-500" },
          { label: "Move-Outs", value: stats.moveOuts, color: "text-yellow-500" },
          { label: "Completed", value: stats.completed, color: "text-muted-foreground" },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <FilterBar>
        {(["all", "move-in", "move-out", "pending", "completed"] as OnboardFilter[]).map((f) => (
          <FilterChip key={f} label={f === "all" ? "All" : f === "move-in" ? "Move-In" : f === "move-out" ? "Move-Out" : f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
        ))}
        <SearchInput value={search} onChange={setSearch} placeholder="Search resident / unit..." />
      </FilterBar>

      <SectionCard title="Move Queue">
        {filtered.length === 0 ? (
          <EmptyState message="No move records found" />
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="border border-border/20 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-card/50 transition-colors text-left"
                >
                  <StatusDot status={r.status === "completed" ? "green" : r.status === "in-progress" ? "yellow" : "gray"} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{r.resident}</span>
                      <span className="text-xs text-muted-foreground font-mono">Unit {r.unit}</span>
                    </div>
                  </div>
                  <Badge className={r.type === "move-in" ? "border-green-500/40 text-green-500" : "border-orange-500/40 text-orange-500"}>
                    {r.type}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">{r.date}</span>
                  <Badge className={`border-border/40 ${r.status === "completed" ? "text-green-500" : r.status === "in-progress" ? "text-yellow-500" : "text-muted-foreground"}`}>
                    {r.status}
                  </Badge>
                </button>

                {expanded === r.id && (
                  // Expanded rows expose the operational checklist and handoff
                  // details needed to complete or close a move record.
                  <div className="px-4 pb-4 pt-2 border-t border-border/20 space-y-4">
                    {/* Checklist */}
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Checklist</h4>
                      <div className="space-y-1.5">
                        {r.checklist.map((item, i) => (
                          <label key={i} className="flex items-center gap-2 text-xs font-mono cursor-pointer group">
                            <span className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${item.done ? "bg-accent border-accent text-background" : "border-border/40 group-hover:border-accent/40"}`}>
                              {item.done && Icons.check}
                            </span>
                            <span className={item.done ? "line-through text-muted-foreground" : ""}>{item.task}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Status details */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="border border-border/20 rounded-md p-2.5">
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Elevator</p>
                        <p className="text-xs font-mono mt-0.5">{r.elevatorBooked ? "✓ Booked" : "Not booked"}</p>
                      </div>
                      <div className="border border-border/20 rounded-md p-2.5">
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Keys</p>
                        <p className="text-xs font-mono mt-0.5">{r.keysHandedOver ? "✓ Handed over" : "Pending"}</p>
                      </div>
                      <div className="border border-border/20 rounded-md p-2.5">
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Deposit</p>
                        <p className="text-xs font-mono mt-0.5">{r.depositStatus}</p>
                      </div>
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

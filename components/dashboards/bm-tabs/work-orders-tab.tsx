"use client";

import React, { useState } from "react";
import { Icons, Badge, FilterBar, FilterChip, SearchInput, SectionCard, StatusDot, EmptyState, SimpleBarChart } from "./bm-shared";

type WOFilter = "all" | "critical" | "high" | "low" | "completed";

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  unit: string;
  reportedBy: string;
  assignedTo: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "open" | "in-progress" | "on-hold" | "completed";
  category: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  estimatedHours: number;
}

const WORK_ORDERS: WorkOrder[] = [
  { id: "WO-001", title: "Burst pipe in unit 8A bathroom", description: "Water leaking from ceiling into unit below", unit: "8A", reportedBy: "Marcus Johnson", assignedTo: "Mike Reynolds", priority: "critical", status: "in-progress", category: "Plumbing", createdAt: "2025-01-14 06:30", updatedAt: "2025-01-14 07:00", dueDate: "2025-01-14", estimatedHours: 4 },
  { id: "WO-002", title: "Elevator B intermittent stoppage", description: "Elevator stops between floors 3-5 periodically", unit: "Common", reportedBy: "Security Staff", assignedTo: "ElevatorCo Inc.", priority: "critical", status: "open", category: "Elevator", createdAt: "2025-01-13 14:00", updatedAt: "2025-01-14 09:00", dueDate: "2025-01-15", estimatedHours: 8 },
  { id: "WO-003", title: "Replace HVAC filter - Floor 12", description: "Quarterly filter replacement", unit: "Floor 12", reportedBy: "Scheduled", assignedTo: "HVAC Solutions", priority: "low", status: "open", category: "HVAC", createdAt: "2025-01-12 09:00", updatedAt: "2025-01-12 09:00", dueDate: "2025-01-20", estimatedHours: 2 },
  { id: "WO-004", title: "Lobby tile repair", description: "Cracked tiles near entrance", unit: "Lobby", reportedBy: "Concierge", assignedTo: "FloorPro LLC", priority: "medium", status: "on-hold", category: "General", createdAt: "2025-01-10 10:00", updatedAt: "2025-01-13 16:00", dueDate: "2025-01-22", estimatedHours: 6 },
  { id: "WO-005", title: "Unit 22C dishwasher replacement", description: "Dishwasher not draining, needs replacement", unit: "22C", reportedBy: "Emily Park", assignedTo: "AppliancePro", priority: "high", status: "open", category: "Appliance", createdAt: "2025-01-13 11:00", updatedAt: "2025-01-14 08:00", dueDate: "2025-01-17", estimatedHours: 3 },
  { id: "WO-006", title: "Parking garage lighting", description: "Section B2 lights flickering", unit: "Garage", reportedBy: "Security Staff", assignedTo: "ElectraCo", priority: "high", status: "in-progress", category: "Electrical", createdAt: "2025-01-11 08:00", updatedAt: "2025-01-14 10:00", dueDate: "2025-01-16", estimatedHours: 4 },
  { id: "WO-007", title: "Touch-up paint hallway Floor 5", description: "Scuff marks on walls", unit: "Floor 5", reportedBy: "Inspection", assignedTo: "Mike Reynolds", priority: "low", status: "completed", category: "General", createdAt: "2025-01-08 09:00", updatedAt: "2025-01-12 16:00", dueDate: "2025-01-12", estimatedHours: 3 },
  { id: "WO-008", title: "Fix intercom Unit 3D", description: "Intercom buzzing, no clear audio", unit: "3D", reportedBy: "David Kim", assignedTo: "Mike Reynolds", priority: "medium", status: "open", category: "Electrical", createdAt: "2025-01-14 10:30", updatedAt: "2025-01-14 10:30", dueDate: "2025-01-18", estimatedHours: 2 },
];

export default function WorkOrdersTab() {
  const [filter, setFilter] = useState<WOFilter>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = WORK_ORDERS.filter((wo) => {
    if (filter === "critical") return wo.priority === "critical";
    if (filter === "high") return wo.priority === "high";
    if (filter === "low") return wo.priority === "low" || wo.priority === "medium";
    if (filter === "completed") return wo.status === "completed";
    return true;
  }).filter((wo) =>
    wo.title.toLowerCase().includes(search.toLowerCase()) ||
    wo.unit.toLowerCase().includes(search.toLowerCase()) ||
    wo.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
    wo.category.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    open: WORK_ORDERS.filter((w) => w.status === "open").length,
    inProgress: WORK_ORDERS.filter((w) => w.status === "in-progress").length,
    onHold: WORK_ORDERS.filter((w) => w.status === "on-hold").length,
    completed: WORK_ORDERS.filter((w) => w.status === "completed").length,
    critical: WORK_ORDERS.filter((w) => w.priority === "critical").length,
  };

  const categoryData = ["Plumbing", "Elevator", "HVAC", "Electrical", "Appliance", "General"].map((cat) => ({
    label: cat.slice(0, 5),
    value: WORK_ORDERS.filter((w) => w.category === cat).length,
  }));

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Open", value: stats.open, color: "text-accent" },
          { label: "In Progress", value: stats.inProgress, color: "text-blue-500" },
          { label: "On Hold", value: stats.onHold, color: "text-yellow-500" },
          { label: "Critical", value: stats.critical, color: "text-red-500" },
          { label: "Completed", value: stats.completed, color: "text-green-500" },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Category chart */}
      <SectionCard title="By Category">
        <div className="h-20">
          <SimpleBarChart data={categoryData} />
        </div>
      </SectionCard>

      <FilterBar>
        {(["all", "critical", "high", "low", "completed"] as WOFilter[]).map((f) => (
          <FilterChip key={f} label={f === "all" ? "All" : f === "low" ? "Med/Low" : f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
        ))}
        <SearchInput value={search} onChange={setSearch} placeholder="Search work orders..." />
      </FilterBar>

      <SectionCard
        title="Work Orders"
        actions={
          <button type="button" className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-accent/40 text-accent hover:bg-accent/10 rounded-md transition-colors">
            {Icons.plus} New Order
          </button>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState message="No work orders found" />
        ) : (
          <div className="space-y-2">
            {filtered.map((wo) => (
              <div key={wo.id} className="border border-border/20 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === wo.id ? null : wo.id)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-card/50 transition-colors text-left"
                >
                  <StatusDot status={
                    wo.priority === "critical" ? "red" :
                    wo.priority === "high" ? "yellow" : "green"
                  } />
                  <span className="text-xs font-mono text-accent w-16">{wo.id}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-sm font-medium truncate block">{wo.title}</span>
                  </div>
                  <Badge className="border-border/40 text-muted-foreground">{wo.category}</Badge>
                  <Badge className={
                    wo.priority === "critical" ? "border-red-500/40 text-red-500" :
                    wo.priority === "high" ? "border-orange-500/40 text-orange-500" :
                    wo.priority === "medium" ? "border-yellow-500/40 text-yellow-500" :
                    "border-green-500/40 text-green-500"
                  }>
                    {wo.priority}
                  </Badge>
                  <Badge className={
                    wo.status === "open" ? "border-blue-500/40 text-blue-500" :
                    wo.status === "in-progress" ? "border-accent/40 text-accent" :
                    wo.status === "on-hold" ? "border-yellow-500/40 text-yellow-500" :
                    "border-green-500/40 text-green-500"
                  }>
                    {wo.status}
                  </Badge>
                </button>

                {expanded === wo.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-border/20 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Unit / Location</span>
                      <p className="mt-0.5">{wo.unit}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Reported By</span>
                      <p className="mt-0.5">{wo.reportedBy}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Assigned To</span>
                      <p className="mt-0.5">{wo.assignedTo}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Due</span>
                      <p className="mt-0.5">{wo.dueDate}</p>
                    </div>
                    <div className="col-span-2 md:col-span-4">
                      <span className="text-[10px] uppercase text-muted-foreground">Description</span>
                      <p className="mt-0.5 text-muted-foreground">{wo.description}</p>
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

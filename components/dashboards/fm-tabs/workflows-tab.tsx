"use client";

import React, { useState, useMemo } from "react";
import { Badge, FilterBar, FilterChip, SearchInput, Icons } from "./fm-shared";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Workflow {
  id: number;
  name: string;
  type: "approval" | "automation" | "escalation" | "notification" | "checklist";
  trigger: string;
  actions: string[];
  status: "active" | "paused" | "draft";
  lastTriggered?: string;
  triggerCount: number;
  createdBy: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_WORKFLOWS: Workflow[] = [
  { id: 1, name: "Work Order Approval > $500", type: "approval", trigger: "New work order created with estimated cost > $500", actions: ["Send approval request to FM Manager", "Wait for approval", "If approved → assign vendor", "If rejected → notify requestor"], status: "active", lastTriggered: "2026-04-01 10:30", triggerCount: 24, createdBy: "Admin" },
  { id: 2, name: "After-hours Emergency Escalation", type: "escalation", trigger: "Critical work order created outside 8 AM–6 PM", actions: ["Page on-call technician via SMS", "If no response in 15 min → call FM Manager", "If no response in 30 min → alert Building Owner"], status: "active", lastTriggered: "2026-03-28 23:15", triggerCount: 8, createdBy: "FM Manager" },
  { id: 3, name: "Lease Expiry Reminder", type: "notification", trigger: "Lease end date within 90 days", actions: ["Email FM Manager with tenant details", "Create follow-up task in calendar", "Notify property management team"], status: "active", lastTriggered: "2026-03-01", triggerCount: 5, createdBy: "Admin" },
  { id: 4, name: "New Resident Onboarding", type: "checklist", trigger: "New resident added to system", actions: ["Generate welcome packet", "Issue key fob", "Set up parking assignment", "Schedule move-in inspection", "Add to resident portal"], status: "active", lastTriggered: "2026-03-20", triggerCount: 12, createdBy: "FM Manager" },
  { id: 5, name: "IoT High-Temp Auto Response", type: "automation", trigger: "Temperature sensor exceeds threshold by 20%", actions: ["Create urgent work order", "Notify HVAC vendor", "Log incident in system", "Alert FM Manager via push notification"], status: "active", lastTriggered: "2026-03-31 08:45", triggerCount: 3, createdBy: "System" },
  { id: 6, name: "Vendor Insurance Expiry Check", type: "notification", trigger: "Vendor insurance expires within 30 days", actions: ["Email vendor requesting updated certificate", "Flag vendor as 'expiring' in system", "Notify FM Manager if not updated within 14 days"], status: "paused", triggerCount: 0, createdBy: "Admin" },
  { id: 7, name: "Monthly PM Task Generator", type: "automation", trigger: "1st of each month at 6 AM", actions: ["Generate preventive maintenance tasks from PM schedule", "Assign to maintenance team", "Set due dates per frequency schedule"], status: "active", lastTriggered: "2026-04-01 06:00", triggerCount: 6, createdBy: "FM Manager" },
  { id: 8, name: "Capital Expenditure Approval", type: "approval", trigger: "Invoice/PO tagged as 'capital' and amount > $5,000", actions: ["Route to FM Manager for review", "If > $10,000 → also route to Building Owner", "Require two approvals before vendor payment"], status: "draft", triggerCount: 0, createdBy: "FM Manager" },
];

const TYPE_COLORS: Record<string, string> = {
  approval: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  automation: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  escalation: "bg-red-500/10 text-red-500 border-red-500/30",
  notification: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  checklist: "bg-green-500/10 text-green-500 border-green-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-500 border-green-500/30",
  paused: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  draft: "bg-muted/40 text-muted-foreground border-border/30",
};

const TYPES = ["all", "approval", "automation", "escalation", "notification", "checklist"];

export function WorkflowsTab() {
  const [workflows, setWorkflows] = useState(MOCK_WORKFLOWS);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "automation" as string, trigger: "", actions: "" });

  const filtered = useMemo(() => {
    return workflows.filter((w) => {
      if (typeFilter !== "all" && w.type !== typeFilter) return false;
      if (statusFilter !== "all" && w.status !== statusFilter) return false;
      if (search && !w.name.toLowerCase().includes(search.toLowerCase()) && !w.trigger.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [workflows, typeFilter, statusFilter, search]);

  const activeCount = workflows.filter((w) => w.status === "active").length;
  const totalTriggers = workflows.reduce((s, w) => s + w.triggerCount, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.trigger.trim()) return;
    const newWorkflow: Workflow = {
      id: workflows.length ? Math.max(...workflows.map((w) => w.id)) + 1 : 1,
      name: form.name.trim(),
      type: form.type as Workflow["type"],
      trigger: form.trigger.trim(),
      actions: form.actions.split("\n").map((a) => a.trim()).filter(Boolean),
      status: "draft",
      triggerCount: 0,
      createdBy: "Facility Manager",
    };
    setWorkflows((prev) => [newWorkflow, ...prev]);
    setForm({ name: "", type: "automation", trigger: "", actions: "" });
    setDialogOpen(false);
  };

  const handleToggleStatus = (id: number) => {
    setWorkflows((prev) => prev.map((w) => {
      if (w.id !== id) return w;
      const next = w.status === "active" ? "paused" : w.status === "paused" ? "active" : "active";
      return { ...w, status: next };
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="border border-green-500/30 rounded-lg px-4 py-2 bg-green-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Active Workflows</span>
          <span className="ml-2 font-mono text-sm font-bold text-green-500">{activeCount}</span>
        </div>
        <div className="border border-border/30 rounded-lg px-4 py-2 bg-card/30">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Total Triggers</span>
          <span className="ml-2 font-mono text-sm font-bold">{totalTriggers}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search workflows..." />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-1 text-xs">{Icons.plus} Create Workflow</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogTitle>Create Workflow</DialogTitle>
            <form onSubmit={handleCreate} className="space-y-3 mt-2">
              <div>
                <label htmlFor="wf-name" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Workflow Name</label>
                <input id="wf-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
              </div>
              <div>
                <label htmlFor="wf-type" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Type</label>
                <select id="wf-type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none">
                  <option value="approval">Approval</option>
                  <option value="automation">Automation</option>
                  <option value="escalation">Escalation</option>
                  <option value="notification">Notification</option>
                  <option value="checklist">Checklist</option>
                </select>
              </div>
              <div>
                <label htmlFor="wf-trigger" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Trigger Condition</label>
                <input id="wf-trigger" value={form.trigger} onChange={(e) => setForm((f) => ({ ...f, trigger: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required placeholder="e.g. When temperature exceeds 180°F" />
              </div>
              <div>
                <label htmlFor="wf-actions" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Actions (one per line)</label>
                <textarea id="wf-actions" value={form.actions} onChange={(e) => setForm((f) => ({ ...f, actions: e.target.value }))} rows={4} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" placeholder={"Notify FM Manager\nCreate work order\nEscalate if unresolved in 1h"} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Create (Draft)</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <FilterBar>
        {TYPES.map((t) => (
          <FilterChip key={t} label={t === "all" ? "All Types" : t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
        ))}
      </FilterBar>
      <div className="flex flex-wrap items-center gap-2">
        {["all", "active", "paused", "draft"].map((s) => (
          <FilterChip key={s} label={s === "all" ? "All Status" : s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No workflows match your filters.</p></Empty>
      ) : (
        <div className="space-y-3">
          {filtered.map((wf) => (
            <div key={wf.id} className="border border-border/30 rounded-lg p-4 bg-card/30">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-mono text-sm font-medium text-foreground">{wf.name}</h3>
                    <Badge className={TYPE_COLORS[wf.type]}>{wf.type}</Badge>
                    <Badge className={STATUS_COLORS[wf.status]}>{wf.status}</Badge>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">{Icons.zap} Trigger: {wf.trigger}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-[10px] h-7 shrink-0 ${wf.status === "active" ? "text-yellow-600 border-yellow-500/30" : "text-green-500 border-green-500/30"}`}
                  onClick={() => handleToggleStatus(wf.id)}
                >
                  {wf.status === "active" ? "Pause" : "Activate"}
                </Button>
              </div>
              <div className="ml-4 border-l-2 border-border/20 pl-3 space-y-1 mb-2">
                {wf.actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2 font-mono text-[10px] text-muted-foreground">
                    <span className="text-accent shrink-0">{i + 1}.</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground">
                <span>Triggered: {wf.triggerCount}x</span>
                {wf.lastTriggered && <span>Last: {wf.lastTriggered}</span>}
                <span>By: {wf.createdBy}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="text-muted-foreground font-mono text-[10px] text-right">{filtered.length} of {workflows.length} workflows</div>
    </div>
  );
}

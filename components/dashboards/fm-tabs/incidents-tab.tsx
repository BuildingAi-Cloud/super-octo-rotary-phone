"use client";

import React, { useState, useMemo } from "react";
import { Badge, FilterBar, FilterChip, SearchInput, Icons } from "./fm-shared";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Incident {
  id: number;
  title: string;
  category: "security_breach" | "slip_fall" | "property_damage" | "fire" | "water_leak" | "medical" | "other";
  description: string;
  location: string;
  reportedBy: string;
  reportedAt: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "reported" | "investigating" | "resolved" | "closed";
  insuranceClaim?: string;
  photos: number;
  witnesses?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_INCIDENTS: Incident[] = [
  { id: 1001, title: "Water leak in parking garage B1", category: "water_leak", description: "Pipe burst on ceiling near stall P2-30, water pooling on floor", location: "Parking B1", reportedBy: "Security Guard", reportedAt: "2026-04-01 06:45", severity: "high", status: "investigating", photos: 3, witnesses: "Guard on duty, resident Unit 102" },
  { id: 1002, title: "Slip on wet floor - lobby", category: "slip_fall", description: "Visitor slipped on freshly mopped floor without signage", location: "Main Lobby", reportedBy: "Concierge", reportedAt: "2026-03-31 14:20", severity: "high", status: "investigating", insuranceClaim: "CLM-2026-0042", photos: 2, witnesses: "Front desk staff" },
  { id: 1003, title: "Broken window - Unit 605", category: "property_damage", description: "Window cracked from exterior impact, possibly wind debris", location: "Unit 605", reportedBy: "Resident", reportedAt: "2026-03-30 22:10", severity: "medium", status: "resolved", photos: 4 },
  { id: 1004, title: "Unauthorized entry attempt", category: "security_breach", description: "Individual attempted to enter building via loading dock at 2 AM", location: "Loading Dock", reportedBy: "Security Camera System", reportedAt: "2026-03-30 02:15", severity: "critical", status: "resolved", photos: 1 },
  { id: 1005, title: "Minor fire in recycle room", category: "fire", description: "Small fire in recycling bin quickly extinguished by sprinkler", location: "Recycle Room - Floor 1", reportedBy: "Fire System", reportedAt: "2026-03-28 11:30", severity: "critical", status: "closed", insuranceClaim: "CLM-2026-0039", photos: 5 },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/30",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  reported: "bg-red-500/10 text-red-500 border-red-500/30",
  investigating: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  resolved: "bg-green-500/10 text-green-500 border-green-500/30",
  closed: "bg-muted/40 text-muted-foreground border-border/30",
};

const CATEGORIES = ["all", "security_breach", "slip_fall", "property_damage", "fire", "water_leak", "medical", "other"];

export function IncidentsTab() {
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", category: "other" as string, description: "", location: "", severity: "medium" as string, witnesses: "" });

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      if (categoryFilter !== "all" && i.category !== categoryFilter) return false;
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.location.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [incidents, categoryFilter, statusFilter, search]);

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    const newIncident: Incident = {
      id: incidents.length ? Math.max(...incidents.map((i) => i.id)) + 1 : 1001,
      title: form.title.trim(),
      category: form.category as Incident["category"],
      description: form.description.trim(),
      location: form.location.trim(),
      reportedBy: "Facility Manager",
      reportedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      severity: form.severity as Incident["severity"],
      status: "reported",
      photos: 0,
      witnesses: form.witnesses.trim() || undefined,
    };
    setIncidents((prev) => [newIncident, ...prev]);
    setForm({ title: "", category: "other", description: "", location: "", severity: "medium", witnesses: "" });
    setDialogOpen(false);
  };

  const handleStatusChange = (id: number, newStatus: Incident["status"]) => {
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)));
  };

  const handleExportCSV = () => {
    const csv = [
      ["ID", "Title", "Category", "Severity", "Location", "Reported By", "Reported At", "Status", "Insurance Claim"],
      ...filtered.map((i) => [i.id, i.title, i.category, i.severity, i.location, i.reportedBy, i.reportedAt, i.status, i.insuranceClaim ?? ""]),
    ].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "incident-reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const openCount = incidents.filter((i) => i.status === "reported" || i.status === "investigating").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="border border-red-500/30 rounded-lg px-4 py-2 bg-red-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Open Incidents</span>
          <span className="ml-2 font-mono text-sm font-bold text-red-500">{openCount}</span>
        </div>
        <div className="border border-border/30 rounded-lg px-4 py-2 bg-card/30">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Total Reports</span>
          <span className="ml-2 font-mono text-sm font-bold">{incidents.length}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search incidents..." />
        <div className="flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-1 text-xs">{Icons.plus} Report Incident</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogTitle>Report Incident</DialogTitle>
              <form onSubmit={handleReport} className="space-y-4 mt-2">
                <div>
                  <label htmlFor="inc-title" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Title</label>
                  <input id="inc-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="inc-cat" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Category</label>
                    <select id="inc-cat" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none">
                      <option value="security_breach">Security Breach</option>
                      <option value="slip_fall">Slip / Fall</option>
                      <option value="property_damage">Property Damage</option>
                      <option value="fire">Fire</option>
                      <option value="water_leak">Water Leak</option>
                      <option value="medical">Medical</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="inc-severity" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Severity</label>
                    <select id="inc-severity" value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none">
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="inc-loc" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Location</label>
                  <input id="inc-loc" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="inc-desc" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Description</label>
                  <textarea id="inc-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                </div>
                <div>
                  <label htmlFor="inc-wit" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Witnesses (optional)</label>
                  <input id="inc-wit" value={form.witnesses} onChange={(e) => setForm((f) => ({ ...f, witnesses: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Submit Report</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-1 text-xs" onClick={handleExportCSV}>{Icons.download} CSV</Button>
        </div>
      </div>

      <FilterBar>
        {CATEGORIES.map((c) => (
          <FilterChip key={c} label={c === "all" ? "All Types" : c.replace("_", " ")} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
        ))}
      </FilterBar>
      <div className="flex flex-wrap items-center gap-2">
        {["all", "reported", "investigating", "resolved", "closed"].map((s) => (
          <FilterChip key={s} label={s === "all" ? "All Status" : s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No incidents match your filters.</p></Empty>
      ) : (
        <div className="space-y-3">
          {filtered.map((incident) => (
            <div key={incident.id} className="border border-border/30 rounded-lg p-4 bg-card/30">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">#{incident.id}</span>
                    <h3 className="font-mono text-sm font-medium text-foreground">{incident.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className={SEVERITY_COLORS[incident.severity]}>{incident.severity}</Badge>
                    <Badge className="bg-muted/20 text-muted-foreground border-border/30">{incident.category.replace("_", " ")}</Badge>
                    <Badge className={STATUS_COLORS[incident.status]}>{incident.status}</Badge>
                  </div>
                </div>
                <select
                  value={incident.status}
                  onChange={(e) => handleStatusChange(incident.id, e.target.value as Incident["status"])}
                  className="text-[10px] font-mono bg-background border border-border/40 rounded px-1.5 py-1 focus:ring-2 focus:ring-accent/50 focus:outline-none shrink-0"
                  aria-label={`Status for incident ${incident.id}`}
                >
                  <option value="reported">Reported</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <p className="font-mono text-xs text-muted-foreground mb-2">{incident.description}</p>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground">
                <span>📍 {incident.location}</span>
                <span>By: {incident.reportedBy}</span>
                <span>{incident.reportedAt}</span>
                <span>📷 {incident.photos} photo{incident.photos !== 1 ? "s" : ""}</span>
                {incident.insuranceClaim && <span className="text-accent">Claim: {incident.insuranceClaim}</span>}
                {incident.witnesses && <span>Witnesses: {incident.witnesses}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="text-muted-foreground font-mono text-[10px] text-right">{filtered.length} of {incidents.length} incidents</div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { Badge, FilterBar, FilterChip, SearchInput, Icons } from "./fm-shared";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface KeyRecord {
  id: number;
  label: string;
  type: "physical" | "fob" | "digital";
  zone: string;
  assignedTo: string;
  unit: string;
  issuedDate: string;
  returnedDate?: string;
  status: "active" | "returned" | "lost" | "disabled";
  accessLevel: "master" | "full" | "restricted" | "temporary";
  smartLock?: boolean;
  notes?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_KEYS: KeyRecord[] = [
  { id: 1, label: "Master Key – Building A", type: "physical", zone: "Building A – All Floors", assignedTo: "John Rivera (Maintenance Lead)", unit: "Staff", issuedDate: "2025-01-10", status: "active", accessLevel: "master" },
  { id: 2, label: "Fob #F-102", type: "fob", zone: "Parking & Gym", assignedTo: "Mia Chen", unit: "Unit 402", issuedDate: "2025-06-15", status: "active", accessLevel: "restricted" },
  { id: 3, label: "Smart Lock – Pool Gate", type: "digital", zone: "Pool Area", assignedTo: "All Residents", unit: "Common", issuedDate: "2025-03-01", status: "active", accessLevel: "restricted", smartLock: true },
  { id: 4, label: "Temp Fob #T-88", type: "fob", zone: "Main Entrance", assignedTo: "Contractor – ABC Plumbing", unit: "Visitor", issuedDate: "2026-03-28", returnedDate: "2026-03-29", status: "returned", accessLevel: "temporary" },
  { id: 5, label: "Digital Access – Unit 605", type: "digital", zone: "Floor 6", assignedTo: "Sam Park", unit: "Unit 605", issuedDate: "2025-08-20", status: "active", accessLevel: "full", smartLock: true },
  { id: 6, label: "Storage Room Key #S-3", type: "physical", zone: "Basement Storage", assignedTo: "Unknown", unit: "—", issuedDate: "2024-11-01", status: "lost", accessLevel: "restricted", notes: "Reported lost 2026-02-10; lock rekeyed" },
];

const ACCESS_LEVEL_COLORS: Record<string, string> = {
  master: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  full: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  restricted: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  temporary: "bg-muted/40 text-muted-foreground border-border/30",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-500 border-green-500/30",
  returned: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  lost: "bg-red-500/10 text-red-500 border-red-500/30",
  disabled: "bg-muted/40 text-muted-foreground border-border/30",
};

const TYPES = ["all", "physical", "fob", "digital"];

export function KeysAccessTab() {
  const [keys, setKeys] = useState(MOCK_KEYS);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ label: "", type: "physical" as string, zone: "", assignedTo: "", unit: "", accessLevel: "restricted" as string, smartLock: false });

  const filtered = useMemo(() => {
    return keys.filter((k) => {
      if (typeFilter !== "all" && k.type !== typeFilter) return false;
      if (statusFilter !== "all" && k.status !== statusFilter) return false;
      if (search && !k.label.toLowerCase().includes(search.toLowerCase()) && !k.assignedTo.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [keys, typeFilter, statusFilter, search]);

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim() || !form.assignedTo.trim()) return;
    const newKey: KeyRecord = {
      id: keys.length ? Math.max(...keys.map((k) => k.id)) + 1 : 1,
      label: form.label.trim(),
      type: form.type as KeyRecord["type"],
      zone: form.zone.trim(),
      assignedTo: form.assignedTo.trim(),
      unit: form.unit.trim() || "—",
      issuedDate: new Date().toISOString().slice(0, 10),
      status: "active",
      accessLevel: form.accessLevel as KeyRecord["accessLevel"],
      smartLock: form.smartLock,
    };
    setKeys((prev) => [newKey, ...prev]);
    setForm({ label: "", type: "physical", zone: "", assignedTo: "", unit: "", accessLevel: "restricted", smartLock: false });
    setDialogOpen(false);
  };

  const handleReturn = (id: number) => {
    setKeys((prev) => prev.map((k) => k.id === id ? { ...k, status: "returned" as const, returnedDate: new Date().toISOString().slice(0, 10) } : k));
  };

  const handleDisable = (id: number) => {
    setKeys((prev) => prev.map((k) => k.id === id ? { ...k, status: "disabled" as const } : k));
  };

  const activeKeys = keys.filter((k) => k.status === "active").length;
  const lostKeys = keys.filter((k) => k.status === "lost").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="border border-green-500/30 rounded-lg px-4 py-2 bg-green-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Active Keys/Fobs</span>
          <span className="ml-2 font-mono text-sm font-bold text-green-500">{activeKeys}</span>
        </div>
        <div className="border border-red-500/30 rounded-lg px-4 py-2 bg-red-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Lost/Missing</span>
          <span className="ml-2 font-mono text-sm font-bold text-red-500">{lostKeys}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search keys or holders..." />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-1 text-xs">{Icons.plus} Issue Key / Fob</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogTitle>Issue Key / Fob / Access</DialogTitle>
            <form onSubmit={handleIssue} className="space-y-3 mt-2">
              <div>
                <label htmlFor="key-label" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Label</label>
                <input id="key-label" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="key-type" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Type</label>
                  <select id="key-type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none">
                    <option value="physical">Physical Key</option>
                    <option value="fob">Key Fob</option>
                    <option value="digital">Digital Access</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="key-level" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Access Level</label>
                  <select id="key-level" value={form.accessLevel} onChange={(e) => setForm((f) => ({ ...f, accessLevel: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none">
                    <option value="master">Master</option>
                    <option value="full">Full</option>
                    <option value="restricted">Restricted</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="key-zone" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Zone / Area</label>
                <input id="key-zone" value={form.zone} onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="key-assigned" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Assigned To</label>
                  <input id="key-assigned" value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                </div>
                <div>
                  <label htmlFor="key-unit" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Unit</label>
                  <input id="key-unit" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.smartLock} onChange={(e) => setForm((f) => ({ ...f, smartLock: e.target.checked }))} className="rounded border-border/40" />
                <span className="text-xs font-mono text-muted-foreground">Smart Lock Enabled</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Issue</Button>
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
        {["all", "active", "returned", "lost", "disabled"].map((s) => (
          <FilterChip key={s} label={s === "all" ? "All Status" : s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No key records match your filters.</p></Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((k) => (
            <div key={k.id} className="border border-border/30 rounded-lg p-4 bg-card/30">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    {Icons.key}
                    <h3 className="font-mono text-sm font-medium text-foreground">{k.label}</h3>
                    {k.smartLock && <span className="text-[9px] font-mono bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-full border border-blue-500/30">🔗 Smart</span>}
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{k.zone}</p>
                </div>
                <Badge className={STATUS_COLORS[k.status]}>{k.status}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className={ACCESS_LEVEL_COLORS[k.accessLevel]}>{k.accessLevel}</Badge>
                <Badge className="bg-muted/20 text-muted-foreground border-border/20">{k.type}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground mb-2">
                <span>Holder: {k.assignedTo}</span>
                <span>Unit: {k.unit}</span>
                <span>Issued: {k.issuedDate}</span>
                {k.returnedDate && <span>Returned: {k.returnedDate}</span>}
              </div>
              {k.notes && <p className="font-mono text-[10px] text-yellow-600 italic mb-2">{k.notes}</p>}
              {k.status === "active" && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={() => handleReturn(k.id)}>Mark Returned</Button>
                  <Button variant="outline" size="sm" className="text-[10px] h-7 text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => handleDisable(k.id)}>Disable</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-muted-foreground font-mono text-[10px] text-right">{filtered.length} of {keys.length} records</div>
    </div>
  );
}

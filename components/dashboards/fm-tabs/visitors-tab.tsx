"use client";

import React, { useState, useMemo } from "react";
import { Badge, FilterBar, FilterChip, SearchInput, Icons } from "./fm-shared";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Visitor {
  id: number;
  name: string;
  type: "guest" | "contractor" | "delivery" | "service";
  host: string;
  unit: string;
  scheduledDate: string;
  scheduledTime: string;
  checkIn?: string;
  checkOut?: string;
  status: "expected" | "checked_in" | "checked_out" | "cancelled";
  accessCode: string;
  idVerified: boolean;
  company?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_VISITORS: Visitor[] = [
  { id: 1, name: "David Kim", type: "contractor", host: "Facility Manager", unit: "Basement", scheduledDate: "2026-04-01", scheduledTime: "09:00-17:00", checkIn: "08:55", status: "checked_in", accessCode: "QR-4821", idVerified: true, company: "PlumbCo" },
  { id: 2, name: "Maria Garcia", type: "guest", host: "Sarah Chen", unit: "Unit 503", scheduledDate: "2026-04-01", scheduledTime: "14:00-18:00", status: "expected", accessCode: "QR-7733", idVerified: false },
  { id: 3, name: "Alex Thompson", type: "service", host: "Building Mgmt", unit: "Lobby", scheduledDate: "2026-04-01", scheduledTime: "10:00-12:00", checkIn: "10:05", checkOut: "11:45", status: "checked_out", accessCode: "QR-1299", idVerified: true, company: "FireSafe Inspections" },
  { id: 4, name: "Jennifer Lee", type: "guest", host: "Mike Robinson", unit: "Unit 812", scheduledDate: "2026-04-01", scheduledTime: "19:00-22:00", status: "expected", accessCode: "QR-5510", idVerified: false },
  { id: 5, name: "Robert Brown", type: "contractor", host: "Facility Manager", unit: "Rooftop", scheduledDate: "2026-04-02", scheduledTime: "08:00-16:00", status: "expected", accessCode: "QR-8847", idVerified: false, company: "HVAC Pros" },
  { id: 6, name: "Pete Martinez", type: "delivery", host: "Front Desk", unit: "Loading Dock", scheduledDate: "2026-03-31", scheduledTime: "07:00-09:00", checkIn: "07:15", checkOut: "07:45", status: "checked_out", accessCode: "QR-3301", idVerified: true, company: "Office Supplies Inc" },
];

const TYPE_COLORS: Record<string, string> = {
  guest: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  contractor: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  delivery: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  service: "bg-teal-500/10 text-teal-500 border-teal-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  expected: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  checked_in: "bg-green-500/10 text-green-500 border-green-500/30",
  checked_out: "bg-muted/40 text-muted-foreground border-border/30",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/30",
};

export function VisitorsTab() {
  const [visitors, setVisitors] = useState(MOCK_VISITORS);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "guest" as string, host: "", unit: "", date: "", time: "", company: "" });

  const filtered = useMemo(() => {
    return visitors.filter((v) => {
      if (typeFilter !== "all" && v.type !== typeFilter) return false;
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.unit.toLowerCase().includes(search.toLowerCase()) && !(v.company ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [visitors, typeFilter, statusFilter, search]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.host.trim()) return;
    const newVisitor: Visitor = {
      id: visitors.length ? Math.max(...visitors.map((v) => v.id)) + 1 : 1,
      name: form.name.trim(),
      type: form.type as Visitor["type"],
      host: form.host.trim(),
      unit: form.unit.trim(),
      scheduledDate: form.date || new Date().toISOString().slice(0, 10),
      scheduledTime: form.time || "09:00-17:00",
      status: "expected",
      accessCode: `QR-${Math.floor(1000 + Math.random() * 9000)}`,
      idVerified: false,
      company: form.company.trim() || undefined,
    };
    setVisitors((prev) => [newVisitor, ...prev]);
    setForm({ name: "", type: "guest", host: "", unit: "", date: "", time: "", company: "" });
    setDialogOpen(false);
  };

  const handleCheckIn = (id: number) => {
    setVisitors((prev) => prev.map((v) => v.id === id ? { ...v, status: "checked_in" as const, checkIn: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), idVerified: true } : v));
  };

  const handleCheckOut = (id: number) => {
    setVisitors((prev) => prev.map((v) => v.id === id ? { ...v, status: "checked_out" as const, checkOut: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } : v));
  };

  const activeCount = visitors.filter((v) => v.status === "checked_in").length;
  const expectedCount = visitors.filter((v) => v.status === "expected").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="border border-green-500/30 rounded-lg px-4 py-2 bg-green-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">On-site Now</span>
          <span className="ml-2 font-mono text-sm font-bold text-green-500">{activeCount}</span>
        </div>
        <div className="border border-yellow-500/30 rounded-lg px-4 py-2 bg-yellow-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Expected Today</span>
          <span className="ml-2 font-mono text-sm font-bold text-yellow-600">{expectedCount}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search visitors..." />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-1 text-xs">{Icons.plus} Register Visitor</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogTitle>Register Visitor / Contractor</DialogTitle>
            <form onSubmit={handleRegister} className="space-y-4 mt-2">
              <div>
                <label htmlFor="vis-name" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Full Name</label>
                <input id="vis-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="vis-type" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Type</label>
                  <select id="vis-type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none">
                    <option value="guest">Guest</option>
                    <option value="contractor">Contractor</option>
                    <option value="delivery">Delivery</option>
                    <option value="service">Service</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="vis-company" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Company</label>
                  <input id="vis-company" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="vis-host" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Host</label>
                  <input id="vis-host" value={form.host} onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                </div>
                <div>
                  <label htmlFor="vis-unit" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Unit / Area</label>
                  <input id="vis-unit" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="vis-date" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Date</label>
                  <input id="vis-date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="vis-time" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Time Window</label>
                  <input id="vis-time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} placeholder="e.g. 09:00-17:00" className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Register</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <FilterBar>
        {["all", "guest", "contractor", "delivery", "service"].map((t) => (
          <FilterChip key={t} label={t === "all" ? "All Types" : t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
        ))}
        <span className="w-px h-4 bg-border/40 mx-1" />
        {["all", "expected", "checked_in", "checked_out"].map((s) => (
          <FilterChip key={s} label={s === "all" ? "All Status" : s.replace("_", " ")} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
      </FilterBar>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No visitors match your filters.</p></Empty>
      ) : (
        <div className="space-y-2">
          {filtered.map((visitor) => (
            <div key={visitor.id} className={`border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${visitor.status === "checked_out" ? "border-border/20 bg-card/20 opacity-70" : "border-border/40 bg-card/40"}`}>
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
                  <span className="font-mono text-[10px] font-bold text-accent uppercase">{visitor.name.charAt(0)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-medium text-foreground">{visitor.name}</span>
                    <Badge className={TYPE_COLORS[visitor.type]}>{visitor.type}</Badge>
                    <Badge className={STATUS_COLORS[visitor.status]}>{visitor.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                    Host: {visitor.host} &middot; {visitor.unit} &middot; {visitor.scheduledDate} {visitor.scheduledTime}
                    {visitor.company && <> &middot; {visitor.company}</>}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                    Access: <span className="text-accent font-semibold">{visitor.accessCode}</span>
                    {visitor.checkIn && <> &middot; In: {visitor.checkIn}</>}
                    {visitor.checkOut && <> &middot; Out: {visitor.checkOut}</>}
                    {visitor.idVerified && <span className="text-green-500 ml-1">✓ ID Verified</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {visitor.status === "expected" && (
                  <Button variant="default" className="text-xs gap-1" onClick={() => handleCheckIn(visitor.id)}>{Icons.check} Check In</Button>
                )}
                {visitor.status === "checked_in" && (
                  <Button variant="outline" className="text-xs" onClick={() => handleCheckOut(visitor.id)}>Check Out</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="text-muted-foreground font-mono text-[10px] text-right">{filtered.length} of {visitors.length} visitors</div>
    </div>
  );
}

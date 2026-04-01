"use client";

import React, { useState, useMemo } from "react";
import { Badge, FilterBar, FilterChip, SearchInput, Icons } from "./fm-shared";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Package {
  id: number;
  carrier: string;
  trackingNumber: string;
  recipient: string;
  unit: string;
  received: string;
  status: "received" | "notified" | "picked_up" | "returned";
  locker?: string;
  notes?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_PACKAGES: Package[] = [
  { id: 1, carrier: "Amazon", trackingNumber: "AMZ-2026-48291", recipient: "Sarah Chen", unit: "Unit 503", received: "2026-04-01 14:30", status: "received", locker: "Locker 12" },
  { id: 2, carrier: "FedEx", trackingNumber: "FDX-2026-78214", recipient: "Mike Robinson", unit: "Unit 812", received: "2026-03-31 09:15", status: "notified", locker: "Locker 5" },
  { id: 3, carrier: "UPS", trackingNumber: "UPS-2026-33105", recipient: "Tom Wright", unit: "Unit 303", received: "2026-03-30 16:45", status: "picked_up" },
  { id: 4, carrier: "USPS", trackingNumber: "USP-2026-91442", recipient: "Emily Davis", unit: "Unit 1204", received: "2026-03-30 11:00", status: "picked_up" },
  { id: 5, carrier: "DHL", trackingNumber: "DHL-2026-55781", recipient: "James Wilson", unit: "Unit 401", received: "2026-03-29 13:20", status: "returned", notes: "Unclaimed after 7 days" },
  { id: 6, carrier: "Amazon", trackingNumber: "AMZ-2026-62018", recipient: "Lisa Park", unit: "Unit 705", received: "2026-04-01 16:00", status: "received", locker: "Locker 8" },
];

const STATUS_COLORS: Record<string, string> = {
  received: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  notified: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  picked_up: "bg-green-500/10 text-green-500 border-green-500/30",
  returned: "bg-red-500/10 text-red-500 border-red-500/30",
};

export function PackagesTab() {
  const [packages, setPackages] = useState(MOCK_PACKAGES);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ carrier: "", trackingNumber: "", recipient: "", unit: "", locker: "" });

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search && !p.recipient.toLowerCase().includes(search.toLowerCase()) && !p.trackingNumber.toLowerCase().includes(search.toLowerCase()) && !p.unit.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [packages, statusFilter, search]);

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.carrier.trim() || !form.recipient.trim() || !form.unit.trim()) return;
    const newPkg: Package = {
      id: packages.length ? Math.max(...packages.map((p) => p.id)) + 1 : 1,
      carrier: form.carrier.trim(),
      trackingNumber: form.trackingNumber.trim() || `PKG-${Date.now()}`,
      recipient: form.recipient.trim(),
      unit: form.unit.trim(),
      received: new Date().toISOString().replace("T", " ").slice(0, 16),
      status: "received",
      locker: form.locker.trim() || undefined,
    };
    setPackages((prev) => [newPkg, ...prev]);
    setForm({ carrier: "", trackingNumber: "", recipient: "", unit: "", locker: "" });
    setDialogOpen(false);
  };

  const handleStatusChange = (id: number, newStatus: Package["status"]) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
  };

  const handleNotify = (id: number) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, status: "notified" as const } : p)));
  };

  const pendingCount = packages.filter((p) => p.status === "received" || p.status === "notified").length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="border border-border/30 rounded-lg px-4 py-2 bg-card/30">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Pending Pickup</span>
          <span className="ml-2 font-mono text-sm font-bold text-accent">{pendingCount}</span>
        </div>
        <div className="border border-border/30 rounded-lg px-4 py-2 bg-card/30">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Today&apos;s Deliveries</span>
          <span className="ml-2 font-mono text-sm font-bold">{packages.filter((p) => p.received.startsWith("2026-04-01")).length}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by recipient, tracking, unit..." />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-1 text-xs">{Icons.plus} Log Package</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogTitle>Log New Package</DialogTitle>
            <form onSubmit={handleLog} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pkg-carrier" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Carrier</label>
                  <input id="pkg-carrier" value={form.carrier} onChange={(e) => setForm((f) => ({ ...f, carrier: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                </div>
                <div>
                  <label htmlFor="pkg-tracking" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Tracking #</label>
                  <input id="pkg-tracking" value={form.trackingNumber} onChange={(e) => setForm((f) => ({ ...f, trackingNumber: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pkg-recipient" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Recipient</label>
                  <input id="pkg-recipient" value={form.recipient} onChange={(e) => setForm((f) => ({ ...f, recipient: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                </div>
                <div>
                  <label htmlFor="pkg-unit" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Unit</label>
                  <input id="pkg-unit" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                </div>
              </div>
              <div>
                <label htmlFor="pkg-locker" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Locker / Location</label>
                <input id="pkg-locker" value={form.locker} onChange={(e) => setForm((f) => ({ ...f, locker: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" placeholder="e.g. Locker 12" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Log Package</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <FilterBar>
        {["all", "received", "notified", "picked_up", "returned"].map((s) => (
          <FilterChip key={s} label={s === "all" ? "All" : s.replace("_", " ")} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
      </FilterBar>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No packages match your filters.</p></Empty>
      ) : (
        <div className="overflow-x-auto border border-border/30 rounded-lg">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="bg-muted/10 border-b border-border/30">
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Tracking</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Carrier</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Recipient</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Unit</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hidden md:table-cell">Locker</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pkg) => (
                <tr key={pkg.id} className="border-b border-border/10 hover:bg-muted/5">
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{pkg.trackingNumber}</td>
                  <td className="py-3 px-4 font-mono text-xs text-foreground">{pkg.carrier}</td>
                  <td className="py-3 px-4 font-mono text-xs text-foreground">{pkg.recipient}</td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground hidden sm:table-cell">{pkg.unit}</td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground hidden md:table-cell">{pkg.locker ?? "—"}</td>
                  <td className="py-3 px-4"><Badge className={STATUS_COLORS[pkg.status]}>{pkg.status.replace("_", " ")}</Badge></td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {pkg.status === "received" && (
                        <button type="button" onClick={() => handleNotify(pkg.id)} className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">Notify</button>
                      )}
                      <select
                        value={pkg.status}
                        onChange={(e) => handleStatusChange(pkg.id, e.target.value as Package["status"])}
                        className="text-[10px] font-mono bg-background border border-border/40 rounded px-1.5 py-1 focus:ring-2 focus:ring-accent/50 focus:outline-none"
                        aria-label={`Status for package ${pkg.trackingNumber}`}
                      >
                        <option value="received">Received</option>
                        <option value="notified">Notified</option>
                        <option value="picked_up">Picked Up</option>
                        <option value="returned">Returned</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="text-muted-foreground font-mono text-[10px] text-right">{filtered.length} of {packages.length} packages</div>
    </div>
  );
}

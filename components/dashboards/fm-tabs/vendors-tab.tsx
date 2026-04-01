"use client";

import React, { useState, useMemo } from "react";
import { Badge, FilterBar, FilterChip, SearchInput, StarRating, Icons } from "./fm-shared";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Vendor {
  id: number;
  name: string;
  trade: string;
  email: string;
  phone: string;
  insuranceExpiry: string;
  licenseNumber: string;
  rating: number;
  status: "active" | "suspended" | "pending_review";
  contractEnd: string;
  completedJobs: number;
  avgResponseHours: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_VENDORS: Vendor[] = [
  { id: 1, name: "PlumbCo Services", trade: "Plumbing", email: "dispatch@plumbco.com", phone: "(555) 100-2001", insuranceExpiry: "2027-01-15", licenseNumber: "PLB-20241", rating: 4, status: "active", contractEnd: "2026-12-31", completedJobs: 48, avgResponseHours: 2.1 },
  { id: 2, name: "HVAC Pros Inc", trade: "HVAC", email: "service@hvacpros.com", phone: "(555) 100-2002", insuranceExpiry: "2026-09-30", licenseNumber: "HVC-30982", rating: 5, status: "active", contractEnd: "2027-03-31", completedJobs: 35, avgResponseHours: 1.5 },
  { id: 3, name: "ElectriFix LLC", trade: "Electrical", email: "jobs@electrifix.com", phone: "(555) 100-2003", insuranceExpiry: "2026-06-15", licenseNumber: "ELC-44521", rating: 3, status: "active", contractEnd: "2026-09-30", completedJobs: 22, avgResponseHours: 3.8 },
  { id: 4, name: "PaintPros Group", trade: "Painting", email: "quotes@paintpros.com", phone: "(555) 100-2004", insuranceExpiry: "2026-04-01", licenseNumber: "PNT-12093", rating: 4, status: "pending_review", contractEnd: "2026-06-30", completedJobs: 12, avgResponseHours: 24 },
  { id: 5, name: "HandyHelp Co", trade: "General", email: "help@handyhelp.com", phone: "(555) 100-2005", insuranceExpiry: "2027-03-15", licenseNumber: "GEN-88410", rating: 4, status: "active", contractEnd: "2027-06-30", completedJobs: 67, avgResponseHours: 4.2 },
  { id: 6, name: "SafeGuard Security", trade: "Security Systems", email: "install@safeguard.com", phone: "(555) 100-2006", insuranceExpiry: "2025-12-01", licenseNumber: "SEC-55012", rating: 2, status: "suspended", contractEnd: "2026-03-31", completedJobs: 8, avgResponseHours: 12 },
];

const TRADE_TYPES = ["All", "Plumbing", "HVAC", "Electrical", "Painting", "General", "Security Systems"];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-500 border-green-500/30",
  suspended: "bg-red-500/10 text-red-500 border-red-500/30",
  pending_review: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
};

// ─── Component ──────────────────────────────────────────────────────────────────
export function VendorsTab() {
  const [vendors, setVendors] = useState(MOCK_VENDORS);
  const [tradeFilter, setTradeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", trade: "Plumbing", email: "", phone: "", licenseNumber: "", insuranceExpiry: "", contractEnd: "" });

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      if (tradeFilter !== "All" && v.trade !== tradeFilter) return false;
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.trade.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [vendors, tradeFilter, statusFilter, search]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    const newVendor: Vendor = {
      id: vendors.length ? Math.max(...vendors.map((v) => v.id)) + 1 : 1,
      name: form.name.trim(),
      trade: form.trade,
      email: form.email.trim(),
      phone: form.phone.trim(),
      insuranceExpiry: form.insuranceExpiry || "2027-01-01",
      licenseNumber: form.licenseNumber.trim() || "PENDING",
      rating: 0,
      status: "pending_review",
      contractEnd: form.contractEnd || "2027-01-01",
      completedJobs: 0,
      avgResponseHours: 0,
    };
    setVendors((prev) => [newVendor, ...prev]);
    setForm({ name: "", trade: "Plumbing", email: "", phone: "", licenseNumber: "", insuranceExpiry: "", contractEnd: "" });
    setDialogOpen(false);
  };

  const handleStatusChange = (id: number, newStatus: Vendor["status"]) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v)));
  };

  const handleRating = (id: number, rating: number) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, rating } : v)));
  };

  const isInsuranceExpiring = (date: string) => {
    const expiry = new Date(date);
    const now = new Date();
    const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff < 60;
  };

  const handleExportCSV = () => {
    const csv = [
      ["ID", "Name", "Trade", "Email", "Phone", "License", "Insurance Expiry", "Rating", "Status", "Jobs", "Avg Response (hrs)"],
      ...filtered.map((v) => [v.id, v.name, v.trade, v.email, v.phone, v.licenseNumber, v.insuranceExpiry, v.rating, v.status, v.completedJobs, v.avgResponseHours]),
    ].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendors.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search vendors..." />
        <div className="flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-1 text-xs">{Icons.plus} Add Vendor</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogTitle>Add Vendor / Contractor</DialogTitle>
              <form onSubmit={handleAdd} className="space-y-4 mt-2">
                <div>
                  <label htmlFor="v-name" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Company Name</label>
                  <input id="v-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="v-trade" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Trade</label>
                    <select id="v-trade" value={form.trade} onChange={(e) => setForm((f) => ({ ...f, trade: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none">
                      {TRADE_TYPES.filter((t) => t !== "All").map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="v-license" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">License #</label>
                    <input id="v-license" value={form.licenseNumber} onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="v-email" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Email</label>
                    <input id="v-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                  </div>
                  <div>
                    <label htmlFor="v-phone" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Phone</label>
                    <input id="v-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="v-ins" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Insurance Expiry</label>
                    <input id="v-ins" type="date" value={form.insuranceExpiry} onChange={(e) => setForm((f) => ({ ...f, insuranceExpiry: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="v-contract" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Contract End</label>
                    <input id="v-contract" type="date" value={form.contractEnd} onChange={(e) => setForm((f) => ({ ...f, contractEnd: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Vendor</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-1 text-xs" onClick={handleExportCSV}>{Icons.download} CSV</Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar>
        {TRADE_TYPES.map((t) => (
          <FilterChip key={t} label={t} active={tradeFilter === t} onClick={() => setTradeFilter(t)} />
        ))}
        <span className="w-px h-4 bg-border/40 mx-1" />
        {["all", "active", "pending_review", "suspended"].map((s) => (
          <FilterChip key={s} label={s === "all" ? "All Status" : s.replace("_", " ")} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
      </FilterBar>

      {/* Vendor Cards */}
      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No vendors match your filters.</p></Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((vendor) => (
            <div key={vendor.id} className="border border-border/30 rounded-lg p-4 bg-card/30 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-mono text-sm font-medium text-foreground">{vendor.name}</h3>
                  <Badge className="mt-1 bg-muted/20 text-muted-foreground border-border/30">{vendor.trade}</Badge>
                </div>
                <select
                  value={vendor.status}
                  onChange={(e) => handleStatusChange(vendor.id, e.target.value as Vendor["status"])}
                  className="text-[10px] font-mono bg-background border border-border/40 rounded px-1.5 py-1 focus:ring-2 focus:ring-accent/50 focus:outline-none"
                  aria-label={`Status for ${vendor.name}`}
                >
                  <option value="active">Active</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="font-mono text-[10px] text-muted-foreground">{vendor.email} &middot; {vendor.phone}</div>
                <div className="font-mono text-[10px] text-muted-foreground">License: {vendor.licenseNumber}</div>
                <div className={`font-mono text-[10px] ${isInsuranceExpiring(vendor.insuranceExpiry) ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
                  Insurance: {vendor.insuranceExpiry} {isInsuranceExpiring(vendor.insuranceExpiry) && "⚠ EXPIRING"}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">Contract ends: {vendor.contractEnd}</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/20">
                <div className="flex items-center gap-2">
                  <StarRating rating={vendor.rating} onChange={(r) => handleRating(vendor.id, r)} />
                  <span className="font-mono text-[10px] text-muted-foreground">({vendor.rating}/5)</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] text-muted-foreground">{vendor.completedJobs} jobs</div>
                  <div className="font-mono text-[10px] text-muted-foreground">~{vendor.avgResponseHours}h response</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-muted-foreground font-mono text-[10px] text-right">{filtered.length} of {vendors.length} vendors</div>
    </div>
  );
}

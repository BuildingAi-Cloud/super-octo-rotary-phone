"use client";

import React, { useState, useMemo } from "react";
import { Badge, FilterBar, FilterChip, SearchInput, Icons } from "./fm-shared";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface ComplianceItem {
  id: number;
  name: string;
  category: "fire_safety" | "elevator" | "health_safety" | "environmental" | "electrical" | "plumbing" | "building_code";
  authority: string;
  lastInspection: string;
  nextDue: string;
  status: "compliant" | "expiring_soon" | "expired" | "pending_inspection";
  certificateRef?: string;
  notes?: string;
  responsible: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_COMPLIANCE: ComplianceItem[] = [
  { id: 1, name: "Annual Fire Alarm Inspection", category: "fire_safety", authority: "City Fire Marshal", lastInspection: "2026-01-15", nextDue: "2027-01-15", status: "compliant", certificateRef: "FA-2026-0042", responsible: "SafetyFirst Inspections" },
  { id: 2, name: "Elevator Permit – Elev. A", category: "elevator", authority: "State Elevator Board", lastInspection: "2025-11-20", nextDue: "2026-05-20", status: "expiring_soon", certificateRef: "ELV-2025-108", responsible: "Otis Service" },
  { id: 3, name: "Backflow Preventer Test", category: "plumbing", authority: "Water Authority", lastInspection: "2025-09-01", nextDue: "2026-09-01", status: "compliant", certificateRef: "BF-2025-77", responsible: "CityPlumb Co." },
  { id: 4, name: "Emergency Lighting Test", category: "electrical", authority: "Fire Code Compliance", lastInspection: "2025-06-10", nextDue: "2026-04-10", status: "expiring_soon", responsible: "In-house" },
  { id: 5, name: "Fire Drill – Q1", category: "fire_safety", authority: "Internal Policy", lastInspection: "2026-03-05", nextDue: "2026-06-05", status: "compliant", responsible: "Facility Manager" },
  { id: 6, name: "Legionella Water Testing", category: "health_safety", authority: "Health Dept.", lastInspection: "2025-03-01", nextDue: "2026-03-01", status: "expired", certificateRef: "LG-2025-09", notes: "Overdue – schedule immediately", responsible: "Lab Corp" },
  { id: 7, name: "Elevator Permit – Elev. B", category: "elevator", authority: "State Elevator Board", lastInspection: "2025-12-10", nextDue: "2026-06-10", status: "compliant", certificateRef: "ELV-2025-109", responsible: "Otis Service" },
  { id: 8, name: "HVAC Refrigerant Compliance", category: "environmental", authority: "EPA", lastInspection: "2025-08-22", nextDue: "2026-08-22", status: "compliant", certificateRef: "EPA-HVAC-221", responsible: "CoolTech HVAC" },
];

const STATUS_COLORS: Record<string, string> = {
  compliant: "bg-green-500/10 text-green-500 border-green-500/30",
  expiring_soon: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  expired: "bg-red-500/10 text-red-500 border-red-500/30",
  pending_inspection: "bg-blue-500/10 text-blue-500 border-blue-500/30",
};

const CATEGORIES = ["all", "fire_safety", "elevator", "health_safety", "environmental", "electrical", "plumbing", "building_code"];

export function ComplianceTab() {
  const [items] = useState(MOCK_COMPLIANCE);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.authority.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, categoryFilter, statusFilter, search]);

  const compliantCount = items.filter((i) => i.status === "compliant").length;
  const expiringCount = items.filter((i) => i.status === "expiring_soon").length;
  const expiredCount = items.filter((i) => i.status === "expired").length;
  const complianceRate = items.length ? Math.round((compliantCount / items.length) * 100) : 0;

  const daysUntilDue = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleExportCSV = () => {
    const csv = [
      ["ID", "Name", "Category", "Authority", "Last Inspection", "Next Due", "Status", "Certificate", "Responsible"],
      ...filtered.map((i) => [i.id, i.name, i.category, i.authority, i.lastInspection, i.nextDue, i.status, i.certificateRef ?? "", i.responsible]),
    ].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compliance-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Compliance Summary */}
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="border border-green-500/30 rounded-lg px-4 py-2 bg-green-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Compliance Rate</span>
          <span className="ml-2 font-mono text-sm font-bold text-green-500">{complianceRate}%</span>
        </div>
        <div className="border border-green-500/30 rounded-lg px-4 py-2 bg-green-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Compliant</span>
          <span className="ml-2 font-mono text-sm font-bold text-green-500">{compliantCount}</span>
        </div>
        <div className="border border-yellow-500/30 rounded-lg px-4 py-2 bg-yellow-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Expiring Soon</span>
          <span className="ml-2 font-mono text-sm font-bold text-yellow-600">{expiringCount}</span>
        </div>
        <div className="border border-red-500/30 rounded-lg px-4 py-2 bg-red-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Expired</span>
          <span className="ml-2 font-mono text-sm font-bold text-red-500">{expiredCount}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search compliance items..." />
        <Button variant="outline" className="gap-1 text-xs" onClick={handleExportCSV}>{Icons.download} Export CSV</Button>
      </div>

      <FilterBar>
        {CATEGORIES.map((c) => (
          <FilterChip key={c} label={c === "all" ? "All Categories" : c.replace(/_/g, " ")} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
        ))}
      </FilterBar>
      <div className="flex flex-wrap items-center gap-2">
        {["all", "compliant", "expiring_soon", "expired", "pending_inspection"].map((s) => (
          <FilterChip key={s} label={s === "all" ? "All Status" : s.replace(/_/g, " ")} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No compliance items match your filters.</p></Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Item</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:table-cell">Authority</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Last</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Due</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Status</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Responsible</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const days = daysUntilDue(item.nextDue);
                return (
                  <tr key={item.id} className="border-b border-border/10 hover:bg-card/50 transition-colors">
                    <td className="py-2.5 px-2">
                      <div>
                        <span className="text-foreground font-medium">{item.name}</span>
                        <span className="block text-[10px] text-muted-foreground capitalize">{item.category.replace(/_/g, " ")}</span>
                        {item.certificateRef && <span className="text-[9px] text-muted-foreground">Cert: {item.certificateRef}</span>}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-muted-foreground hidden sm:table-cell">{item.authority}</td>
                    <td className="py-2.5 px-2 text-muted-foreground">{item.lastInspection}</td>
                    <td className="py-2.5 px-2">
                      <span className={days < 0 ? "text-red-500 font-bold" : days < 30 ? "text-yellow-600" : "text-muted-foreground"}>
                        {item.nextDue}
                      </span>
                      <span className="block text-[9px] text-muted-foreground">
                        {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d remaining`}
                      </span>
                    </td>
                    <td className="py-2.5 px-2"><Badge className={STATUS_COLORS[item.status]}>{item.status.replace(/_/g, " ")}</Badge></td>
                    <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{item.responsible}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {items.filter((i) => i.notes).length > 0 && (
        <div className="mt-2 border-t border-border/20 pt-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Alerts</span>
          {items.filter((i) => i.notes).map((i) => (
            <p key={i.id} className="font-mono text-[10px] text-yellow-600 mt-1">⚠ {i.name}: {i.notes}</p>
          ))}
        </div>
      )}
      <div className="text-muted-foreground font-mono text-[10px] text-right">{filtered.length} of {items.length} items</div>
    </div>
  );
}

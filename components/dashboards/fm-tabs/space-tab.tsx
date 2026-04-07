"use client";

import React, { useState, useMemo } from "react";
import { Badge, FilterBar, FilterChip, SearchInput, Icons, SimpleBarChart } from "./fm-shared";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Space {
  id: number;
  name: string;
  type: "office" | "meeting_room" | "common_area" | "storage" | "retail" | "residential" | "parking" | "utility";
  floor: string;
  area_sqft: number;
  capacity: number;
  currentOccupancy: number;
  status: "occupied" | "vacant" | "under_renovation" | "reserved";
  tenant?: string;
  leaseEnd?: string;
  monthlyRate?: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_SPACES: Space[] = [
  { id: 1, name: "Suite 101 – Reception", type: "office", floor: "Floor 1", area_sqft: 1200, capacity: 8, currentOccupancy: 6, status: "occupied", tenant: "TechCorp Inc.", leaseEnd: "2027-03-31", monthlyRate: 3600 },
  { id: 2, name: "Conference Room A", type: "meeting_room", floor: "Floor 2", area_sqft: 450, capacity: 16, currentOccupancy: 0, status: "occupied", tenant: "Shared" },
  { id: 3, name: "Suite 305", type: "office", floor: "Floor 3", area_sqft: 2400, capacity: 20, currentOccupancy: 0, status: "vacant", monthlyRate: 7200 },
  { id: 4, name: "Main Lobby", type: "common_area", floor: "Floor 1", area_sqft: 3000, capacity: 50, currentOccupancy: 12, status: "occupied" },
  { id: 5, name: "Storage B1-A", type: "storage", floor: "Basement 1", area_sqft: 800, capacity: 0, currentOccupancy: 0, status: "occupied", tenant: "Building Ops" },
  { id: 6, name: "Suite 210 – Reno", type: "office", floor: "Floor 2", area_sqft: 1800, capacity: 15, currentOccupancy: 0, status: "under_renovation" },
  { id: 7, name: "Parking Level P1", type: "parking", floor: "P1", area_sqft: 15000, capacity: 60, currentOccupancy: 42, status: "occupied" },
  { id: 8, name: "Unit 401", type: "residential", floor: "Floor 4", area_sqft: 950, capacity: 4, currentOccupancy: 2, status: "occupied", tenant: "M. Chen", leaseEnd: "2026-08-31", monthlyRate: 2200 },
  { id: 9, name: "Unit 402", type: "residential", floor: "Floor 4", area_sqft: 1100, capacity: 4, currentOccupancy: 3, status: "occupied", tenant: "A. Patel", leaseEnd: "2026-12-31", monthlyRate: 2500 },
  { id: 10, name: "Retail – Ground", type: "retail", floor: "Floor 1", area_sqft: 2000, capacity: 30, currentOccupancy: 0, status: "reserved", tenant: "PendingLease Co.", leaseEnd: "2026-06-01", monthlyRate: 5000 },
];

const STATUS_COLORS: Record<string, string> = {
  occupied: "bg-green-500/10 text-green-500 border-green-500/30",
  vacant: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  under_renovation: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  reserved: "bg-purple-500/10 text-purple-500 border-purple-500/30",
};

const TYPES = ["all", "office", "meeting_room", "common_area", "storage", "retail", "residential", "parking", "utility"];

export function SpaceTab() {
  const [spaces] = useState(MOCK_SPACES);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return spaces.filter((s) => {
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !(s.tenant ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [spaces, typeFilter, statusFilter, search]);

  const totalSqft = spaces.reduce((s, sp) => s + sp.area_sqft, 0);
  const occupiedSqft = spaces.filter((s) => s.status === "occupied").reduce((acc, s) => acc + s.area_sqft, 0);
  const vacantSqft = spaces.filter((s) => s.status === "vacant").reduce((acc, s) => acc + s.area_sqft, 0);
  const utilization = totalSqft ? Math.round((occupiedSqft / totalSqft) * 100) : 0;
  const monthlyRevenue = spaces.reduce((s, sp) => s + (sp.monthlyRate ?? 0), 0);

  // Utilization by floor
  const floors = [...new Set(spaces.map((s) => s.floor))];
  const floorData = floors.map((floor) => {
    const floorSpaces = spaces.filter((s) => s.floor === floor);
    const totalCap = floorSpaces.reduce((s, sp) => s + sp.capacity, 0);
    const totalOcc = floorSpaces.reduce((s, sp) => s + sp.currentOccupancy, 0);
    return { label: floor, value: totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : 0 };
  }).filter((d) => d.value > 0 || d.label);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="border border-blue-500/30 rounded-lg px-4 py-2 bg-blue-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Total Area</span>
          <span className="ml-2 font-mono text-sm font-bold text-blue-500">{(totalSqft / 1000).toFixed(1)}k sqft</span>
        </div>
        <div className="border border-green-500/30 rounded-lg px-4 py-2 bg-green-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Utilization</span>
          <span className="ml-2 font-mono text-sm font-bold text-green-500">{utilization}%</span>
        </div>
        <div className="border border-yellow-500/30 rounded-lg px-4 py-2 bg-yellow-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Vacant</span>
          <span className="ml-2 font-mono text-sm font-bold text-yellow-600">{(vacantSqft / 1000).toFixed(1)}k sqft</span>
        </div>
        <div className="border border-border/30 rounded-lg px-4 py-2 bg-card/30">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Monthly Revenue</span>
          <span className="ml-2 font-mono text-sm font-bold">${monthlyRevenue.toLocaleString()}</span>
        </div>
      </div>

      {floorData.length > 0 && (
        <div className="border border-border/20 rounded-lg p-4 bg-card/20">
          <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Occupancy % by Floor</h4>
          <SimpleBarChart data={floorData} maxValue={100} formatValue={(v) => `${v}%`} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search spaces..." />
        <Button variant="outline" className="gap-1 text-xs" onClick={() => {
          const csv = [
            ["ID", "Name", "Type", "Floor", "Area (sqft)", "Capacity", "Occupancy", "Status", "Tenant", "Lease End", "Monthly Rate"],
            ...filtered.map((s) => [s.id, s.name, s.type, s.floor, s.area_sqft, s.capacity, s.currentOccupancy, s.status, s.tenant ?? "", s.leaseEnd ?? "", s.monthlyRate ?? ""]),
          ].map((r) => r.join(",")).join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "space-report.csv"; a.click();
          URL.revokeObjectURL(url);
        }}>{Icons.download} CSV</Button>
      </div>

      <FilterBar>
        {TYPES.map((t) => (
          <FilterChip key={t} label={t === "all" ? "All Types" : t.replace(/_/g, " ")} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
        ))}
      </FilterBar>
      <div className="flex flex-wrap items-center gap-2">
        {["all", "occupied", "vacant", "under_renovation", "reserved"].map((s) => (
          <FilterChip key={s} label={s === "all" ? "All Status" : s.replace(/_/g, " ")} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No spaces match your filters.</p></Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Space</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:table-cell">Floor</th>
                <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Area</th>
                <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Occupancy</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Status</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hidden lg:table-cell">Tenant</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((space) => (
                <tr key={space.id} className="border-b border-border/10 hover:bg-card/50 transition-colors">
                  <td className="py-2.5 px-2">
                    <span className="text-foreground font-medium">{space.name}</span>
                    <span className="block text-[10px] text-muted-foreground capitalize">{space.type.replace(/_/g, " ")}</span>
                  </td>
                  <td className="py-2.5 px-2 text-muted-foreground hidden sm:table-cell">{space.floor}</td>
                  <td className="py-2.5 px-2 text-right text-muted-foreground">{space.area_sqft.toLocaleString()} sqft</td>
                  <td className="py-2.5 px-2 text-right hidden md:table-cell">
                    {space.capacity > 0 ? (
                      <span className={space.currentOccupancy / space.capacity > 0.8 ? "text-red-500" : "text-muted-foreground"}>
                        {space.currentOccupancy}/{space.capacity}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2"><Badge className={STATUS_COLORS[space.status]}>{space.status.replace(/_/g, " ")}</Badge></td>
                  <td className="py-2.5 px-2 text-muted-foreground hidden lg:table-cell">
                    {space.tenant ?? "—"}
                    {space.leaseEnd && <span className="block text-[9px]">Lease: {space.leaseEnd}</span>}
                    {space.monthlyRate && <span className="block text-[9px]">${space.monthlyRate.toLocaleString()}/mo</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="text-muted-foreground font-mono text-[10px] text-right">{filtered.length} of {spaces.length} spaces</div>
    </div>
  );
}

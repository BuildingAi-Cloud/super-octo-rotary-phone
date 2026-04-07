"use client";

import React, { useState, useMemo } from "react";
import { Badge, FilterBar, FilterChip, SearchInput, Icons, SimpleBarChart } from "./fm-shared";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Asset {
  id: number;
  name: string;
  category: "hvac" | "plumbing" | "electrical" | "elevator" | "fire_safety" | "structural" | "appliance" | "it_network";
  location: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyEnd: string;
  lifecycleStage: "new" | "active" | "aging" | "end_of_life";
  condition: "excellent" | "good" | "fair" | "poor";
  nextService: string;
  depreciatedValue: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_ASSETS: Asset[] = [
  { id: 1, name: "Chiller Unit – Roof A", category: "hvac", location: "Roof Level A", manufacturer: "Carrier", model: "30XA-200", serialNumber: "CU-2022-0445", purchaseDate: "2022-06-15", purchaseCost: 85000, warrantyEnd: "2027-06-15", lifecycleStage: "active", condition: "good", nextService: "2026-06-15", depreciatedValue: 68000 },
  { id: 2, name: "Elevator Motor – Elev A", category: "elevator", location: "Mechanical Room B1", manufacturer: "Otis", model: "Gen3-MRL", serialNumber: "EA-2019-1120", purchaseDate: "2019-03-10", purchaseCost: 120000, warrantyEnd: "2024-03-10", lifecycleStage: "aging", condition: "fair", nextService: "2026-04-10", depreciatedValue: 54000 },
  { id: 3, name: "Fire Pump – Main", category: "fire_safety", location: "Fire Pump Room", manufacturer: "Grundfos", model: "NKF-80", serialNumber: "FP-2021-0088", purchaseDate: "2021-01-20", purchaseCost: 35000, warrantyEnd: "2026-01-20", lifecycleStage: "active", condition: "excellent", nextService: "2026-07-20", depreciatedValue: 28000 },
  { id: 4, name: "Boiler – Central", category: "plumbing", location: "Boiler Room", manufacturer: "Weil-McLain", model: "SlimFit-750", serialNumber: "BL-2017-0321", purchaseDate: "2017-11-05", purchaseCost: 45000, warrantyEnd: "2022-11-05", lifecycleStage: "end_of_life", condition: "poor", nextService: "2026-04-05", depreciatedValue: 9000 },
  { id: 5, name: "Generator – Emergency", category: "electrical", location: "Generator Room", manufacturer: "Caterpillar", model: "C15-500", serialNumber: "GN-2023-0012", purchaseDate: "2023-09-01", purchaseCost: 150000, warrantyEnd: "2028-09-01", lifecycleStage: "new", condition: "excellent", nextService: "2026-09-01", depreciatedValue: 135000 },
  { id: 6, name: "Network Switch – MDF", category: "it_network", location: "MDF Room Floor 1", manufacturer: "Cisco", model: "Catalyst 9300", serialNumber: "NS-2024-0078", purchaseDate: "2024-02-15", purchaseCost: 8500, warrantyEnd: "2027-02-15", lifecycleStage: "new", condition: "excellent", nextService: "2027-02-15", depreciatedValue: 7650 },
];

const LIFECYCLE_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  active: "bg-green-500/10 text-green-500 border-green-500/30",
  aging: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  end_of_life: "bg-red-500/10 text-red-500 border-red-500/30",
};

const CONDITION_COLORS: Record<string, string> = {
  excellent: "bg-green-500/10 text-green-500 border-green-500/30",
  good: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  fair: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  poor: "bg-red-500/10 text-red-500 border-red-500/30",
};

const CATEGORIES = ["all", "hvac", "plumbing", "electrical", "elevator", "fire_safety", "structural", "appliance", "it_network"];

export function AssetsTab() {
  const [assets, setAssets] = useState(MOCK_ASSETS);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [lifecycleFilter, setLifecycleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "hvac" as string, location: "", manufacturer: "", model: "", serialNumber: "", purchaseCost: "", warrantyYears: "5" });

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
      if (lifecycleFilter !== "all" && a.lifecycleStage !== lifecycleFilter) return false;
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.manufacturer.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [assets, categoryFilter, lifecycleFilter, search]);

  const totalValue = assets.reduce((s, a) => s + a.depreciatedValue, 0);
  const totalCost = assets.reduce((s, a) => s + a.purchaseCost, 0);
  const warrantyExpired = assets.filter((a) => new Date(a.warrantyEnd) < new Date()).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const now = new Date().toISOString().slice(0, 10);
    const cost = parseFloat(form.purchaseCost) || 0;
    const warrantyEnd = new Date();
    warrantyEnd.setFullYear(warrantyEnd.getFullYear() + parseInt(form.warrantyYears));
    const newAsset: Asset = {
      id: assets.length ? Math.max(...assets.map((a) => a.id)) + 1 : 1,
      name: form.name.trim(),
      category: form.category as Asset["category"],
      location: form.location.trim(),
      manufacturer: form.manufacturer.trim(),
      model: form.model.trim(),
      serialNumber: form.serialNumber.trim() || `SN-${Date.now()}`,
      purchaseDate: now,
      purchaseCost: cost,
      warrantyEnd: warrantyEnd.toISOString().slice(0, 10),
      lifecycleStage: "new",
      condition: "excellent",
      nextService: warrantyEnd.toISOString().slice(0, 10),
      depreciatedValue: cost,
    };
    setAssets((prev) => [newAsset, ...prev]);
    setForm({ name: "", category: "hvac", location: "", manufacturer: "", model: "", serialNumber: "", purchaseCost: "", warrantyYears: "5" });
    setDialogOpen(false);
  };

  // Depreciation chart data by category
  const depreciationByCategory = CATEGORIES.filter((c) => c !== "all").map((cat) => {
    const catAssets = assets.filter((a) => a.category === cat);
    const total = catAssets.reduce((s, a) => s + a.depreciatedValue, 0);
    return { label: cat.replace(/_/g, " "), value: total };
  }).filter((d) => d.value > 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="border border-border/30 rounded-lg px-4 py-2 bg-card/30">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Total Assets</span>
          <span className="ml-2 font-mono text-sm font-bold">{assets.length}</span>
        </div>
        <div className="border border-green-500/30 rounded-lg px-4 py-2 bg-green-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Current Value</span>
          <span className="ml-2 font-mono text-sm font-bold text-green-500">${(totalValue / 1000).toFixed(0)}k</span>
        </div>
        <div className="border border-blue-500/30 rounded-lg px-4 py-2 bg-blue-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Original Cost</span>
          <span className="ml-2 font-mono text-sm font-bold text-blue-500">${(totalCost / 1000).toFixed(0)}k</span>
        </div>
        <div className="border border-red-500/30 rounded-lg px-4 py-2 bg-red-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Warranty Expired</span>
          <span className="ml-2 font-mono text-sm font-bold text-red-500">{warrantyExpired}</span>
        </div>
      </div>

      {depreciationByCategory.length > 0 && (
        <div className="border border-border/20 rounded-lg p-4 bg-card/20">
          <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Depreciated Value by Category</h4>
          <SimpleBarChart data={depreciationByCategory} maxValue={Math.max(...depreciationByCategory.map((d) => d.value))} formatValue={(v) => `$${(v / 1000).toFixed(0)}k`} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search assets..." />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-1 text-xs">{Icons.plus} Register Asset</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogTitle>Register Asset</DialogTitle>
            <form onSubmit={handleAdd} className="space-y-3 mt-2">
              <div>
                <label htmlFor="asset-name" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Asset Name</label>
                <input id="asset-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="asset-cat" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Category</label>
                  <select id="asset-cat" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none">
                    {CATEGORIES.filter((c) => c !== "all").map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="asset-loc" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Location</label>
                  <input id="asset-loc" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="asset-mfg" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Manufacturer</label>
                  <input id="asset-mfg" value={form.manufacturer} onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="asset-mdl" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Model</label>
                  <input id="asset-mdl" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="asset-sn" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Serial #</label>
                  <input id="asset-sn" value={form.serialNumber} onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="asset-cost" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Cost ($)</label>
                  <input id="asset-cost" type="number" value={form.purchaseCost} onChange={(e) => setForm((f) => ({ ...f, purchaseCost: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="asset-warr" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Warranty (yrs)</label>
                  <input id="asset-warr" type="number" value={form.warrantyYears} onChange={(e) => setForm((f) => ({ ...f, warrantyYears: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
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
        {CATEGORIES.map((c) => (
          <FilterChip key={c} label={c === "all" ? "All Categories" : c.replace(/_/g, " ")} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
        ))}
      </FilterBar>
      <div className="flex flex-wrap items-center gap-2">
        {["all", "new", "active", "aging", "end_of_life"].map((s) => (
          <FilterChip key={s} label={s === "all" ? "All Lifecycle" : s.replace(/_/g, " ")} active={lifecycleFilter === s} onClick={() => setLifecycleFilter(s)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No assets match your filters.</p></Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((asset) => {
            const warrantyActive = new Date(asset.warrantyEnd) > new Date();
            return (
              <div key={asset.id} className="border border-border/30 rounded-lg p-4 bg-card/30">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-mono text-sm font-medium text-foreground">{asset.name}</h3>
                    <p className="font-mono text-[10px] text-muted-foreground">{asset.manufacturer} {asset.model} • {asset.location}</p>
                  </div>
                  <Badge className={LIFECYCLE_COLORS[asset.lifecycleStage]}>{asset.lifecycleStage.replace(/_/g, " ")}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={CONDITION_COLORS[asset.condition]}>{asset.condition}</Badge>
                  <Badge className="bg-muted/20 text-muted-foreground border-border/20">{asset.category.replace(/_/g, " ")}</Badge>
                  <Badge className={warrantyActive ? "bg-green-500/10 text-green-500 border-green-500/30" : "bg-red-500/10 text-red-500 border-red-500/30"}>
                    {warrantyActive ? "Warranty Active" : "Warranty Expired"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] text-muted-foreground">
                  <span>Serial: {asset.serialNumber}</span>
                  <span>Purchased: {asset.purchaseDate}</span>
                  <span>Cost: ${asset.purchaseCost.toLocaleString()}</span>
                  <span>Value: ${asset.depreciatedValue.toLocaleString()}</span>
                  <span>Warranty: {asset.warrantyEnd}</span>
                  <span>Next Service: {asset.nextService}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="text-muted-foreground font-mono text-[10px] text-right">{filtered.length} of {assets.length} assets</div>
    </div>
  );
}

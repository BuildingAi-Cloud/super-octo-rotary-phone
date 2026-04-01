"use client";

import React, { useState } from "react";
import { Badge, Icons, SimpleBarChart, SectionCard } from "./fm-shared";
import { Button } from "@/components/ui/button";

// ─── Report Data ────────────────────────────────────────────────────────────────
const ENERGY_DATA = [
  { label: "Jan", value: 42000 },
  { label: "Feb", value: 38000 },
  { label: "Mar", value: 35000 },
  { label: "Apr", value: 32000 },
  { label: "May", value: 44000 },
  { label: "Jun", value: 52000 },
];

const WORK_ORDER_TYPES = [
  { label: "Plumbing", value: 28 },
  { label: "HVAC", value: 22 },
  { label: "Electrical", value: 18 },
  { label: "Structural", value: 8 },
  { label: "Pest Control", value: 6 },
  { label: "General", value: 34 },
];

const VENDOR_RESPONSE = [
  { label: "ABC Plumbing", value: 2.1 },
  { label: "CoolTech HVAC", value: 3.5 },
  { label: "SparkWorks Elec.", value: 1.8 },
  { label: "CleanPro Janitorial", value: 4.2 },
  { label: "SafeGuard Security", value: 1.2 },
];

const MONTHLY_COSTS = [
  { label: "Jan", value: 18500 },
  { label: "Feb", value: 22000 },
  { label: "Mar", value: 16000 },
  { label: "Apr", value: 21000 },
  { label: "May", value: 19500 },
  { label: "Jun", value: 24000 },
];

const KPI_DATA = [
  { label: "Avg. Resolution Time", value: "18.2h", trend: "down", trendLabel: "↓ 12% vs last month" },
  { label: "First-Call Fix Rate", value: "73%", trend: "up", trendLabel: "↑ 5% vs last month" },
  { label: "Tenant Satisfaction", value: "4.2/5", trend: "up", trendLabel: "↑ 0.3 vs last quarter" },
  { label: "PM Compliance", value: "91%", trend: "up", trendLabel: "↑ 4% vs last month" },
  { label: "Work Order Backlog", value: "12", trend: "down", trendLabel: "↓ 3 vs last week" },
  { label: "Emergency Calls (MTD)", value: "4", trend: "neutral", trendLabel: "Same as last month" },
];

type ReportSection = "kpis" | "energy" | "work_orders" | "vendors" | "costs";

export function ReportsTab() {
  const [activeSection, setActiveSection] = useState<ReportSection>("kpis");

  const sections: { key: ReportSection; label: string }[] = [
    { key: "kpis", label: "KPIs" },
    { key: "energy", label: "Energy" },
    { key: "work_orders", label: "Work Orders" },
    { key: "vendors", label: "Vendors" },
    { key: "costs", label: "Costs" },
  ];

  return (
    <div className="space-y-4">
      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/20 pb-3">
        {sections.map((sec) => (
          <button
            key={sec.key}
            onClick={() => setActiveSection(sec.key)}
            className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-md border transition-colors ${
              activeSection === sec.key
                ? "bg-accent/20 text-accent border-accent/40"
                : "bg-card/30 text-muted-foreground border-border/20 hover:bg-card/50"
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      {activeSection === "kpis" && (
        <div>
          <h3 className="font-[var(--font-bebas)] text-lg tracking-wider mb-3">Key Performance Indicators</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {KPI_DATA.map((kpi) => (
              <div key={kpi.label} className="border border-border/30 rounded-lg p-4 bg-card/30">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{kpi.label}</span>
                <div className="font-mono text-2xl font-bold mt-1">{kpi.value}</div>
                <span className={`font-mono text-[10px] ${kpi.trend === "up" ? "text-green-500" : kpi.trend === "down" ? (kpi.label.includes("Backlog") || kpi.label.includes("Resolution") ? "text-green-500" : "text-red-500") : "text-muted-foreground"}`}>
                  {kpi.trendLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Energy */}
      {activeSection === "energy" && (
        <div>
          <h3 className="font-[var(--font-bebas)] text-lg tracking-wider mb-3">Energy Consumption (kWh)</h3>
          <SectionCard>
            <SimpleBarChart data={ENERGY_DATA} maxValue={Math.max(...ENERGY_DATA.map((d) => d.value))} formatValue={(v) => `${(v / 1000).toFixed(0)}k kWh`} />
          </SectionCard>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="border border-border/30 rounded-lg p-3 bg-card/30 text-center">
              <span className="font-mono text-[10px] text-muted-foreground uppercase block">Total (6mo)</span>
              <span className="font-mono text-lg font-bold">{(ENERGY_DATA.reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}k</span>
            </div>
            <div className="border border-border/30 rounded-lg p-3 bg-card/30 text-center">
              <span className="font-mono text-[10px] text-muted-foreground uppercase block">Avg/Month</span>
              <span className="font-mono text-lg font-bold">{(ENERGY_DATA.reduce((s, d) => s + d.value, 0) / ENERGY_DATA.length / 1000).toFixed(1)}k</span>
            </div>
            <div className="border border-border/30 rounded-lg p-3 bg-card/30 text-center">
              <span className="font-mono text-[10px] text-muted-foreground uppercase block">Peak Month</span>
              <span className="font-mono text-lg font-bold">{ENERGY_DATA.reduce((max, d) => d.value > max.value ? d : max, ENERGY_DATA[0]).label}</span>
            </div>
          </div>
        </div>
      )}

      {/* Work Orders */}
      {activeSection === "work_orders" && (
        <div>
          <h3 className="font-[var(--font-bebas)] text-lg tracking-wider mb-3">Work Order Distribution</h3>
          <SectionCard>
            <SimpleBarChart data={WORK_ORDER_TYPES} maxValue={Math.max(...WORK_ORDER_TYPES.map((d) => d.value))} formatValue={(v) => `${v} orders`} />
          </SectionCard>
          <div className="mt-3 border border-border/30 rounded-lg p-3 bg-card/30">
            <span className="font-mono text-[10px] text-muted-foreground uppercase">Total Work Orders (6mo): </span>
            <span className="font-mono text-sm font-bold">{WORK_ORDER_TYPES.reduce((s, d) => s + d.value, 0)}</span>
          </div>
        </div>
      )}

      {/* Vendors */}
      {activeSection === "vendors" && (
        <div>
          <h3 className="font-[var(--font-bebas)] text-lg tracking-wider mb-3">Vendor Avg. Response Time (hours)</h3>
          <SectionCard>
            <SimpleBarChart data={VENDOR_RESPONSE} maxValue={Math.max(...VENDOR_RESPONSE.map((d) => d.value))} formatValue={(v) => `${v}h`} />
          </SectionCard>
          <div className="mt-3 grid gap-2">
            {VENDOR_RESPONSE.map((v) => (
              <div key={v.label} className="flex items-center justify-between border border-border/10 rounded px-3 py-2 font-mono text-xs">
                <span>{v.label}</span>
                <Badge className={v.value <= 2 ? "bg-green-500/10 text-green-500 border-green-500/30" : v.value <= 3.5 ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" : "bg-red-500/10 text-red-500 border-red-500/30"}>
                  {v.value}h avg
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Costs */}
      {activeSection === "costs" && (
        <div>
          <h3 className="font-[var(--font-bebas)] text-lg tracking-wider mb-3">Monthly Maintenance Costs</h3>
          <SectionCard>
            <SimpleBarChart data={MONTHLY_COSTS} maxValue={Math.max(...MONTHLY_COSTS.map((d) => d.value))} formatValue={(v) => `$${(v / 1000).toFixed(1)}k`} />
          </SectionCard>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="border border-border/30 rounded-lg p-3 bg-card/30 text-center">
              <span className="font-mono text-[10px] text-muted-foreground uppercase block">Total (6mo)</span>
              <span className="font-mono text-lg font-bold">${(MONTHLY_COSTS.reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}k</span>
            </div>
            <div className="border border-border/30 rounded-lg p-3 bg-card/30 text-center">
              <span className="font-mono text-[10px] text-muted-foreground uppercase block">Avg/Month</span>
              <span className="font-mono text-lg font-bold">${(MONTHLY_COSTS.reduce((s, d) => s + d.value, 0) / MONTHLY_COSTS.length / 1000).toFixed(1)}k</span>
            </div>
            <div className="border border-border/30 rounded-lg p-3 bg-card/30 text-center">
              <span className="font-mono text-[10px] text-muted-foreground uppercase block">Budget Remaining</span>
              <span className="font-mono text-lg font-bold text-green-500">$48k</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button variant="outline" className="gap-1 text-xs" onClick={() => {
          const csvRows = [["Report", "Label", "Value"]];
          ENERGY_DATA.forEach((d) => csvRows.push(["Energy (kWh)", d.label, String(d.value)]));
          WORK_ORDER_TYPES.forEach((d) => csvRows.push(["Work Orders", d.label, String(d.value)]));
          VENDOR_RESPONSE.forEach((d) => csvRows.push(["Vendor Response (hrs)", d.label, String(d.value)]));
          MONTHLY_COSTS.forEach((d) => csvRows.push(["Maintenance Cost ($)", d.label, String(d.value)]));
          const csv = csvRows.map((r) => r.join(",")).join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = "fm-reports.csv"; a.click();
          URL.revokeObjectURL(url);
        }}>{Icons.download} Export All Reports</Button>
      </div>
    </div>
  );
}

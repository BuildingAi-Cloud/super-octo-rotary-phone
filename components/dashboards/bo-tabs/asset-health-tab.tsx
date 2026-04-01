"use client";

import React, { useState } from "react";
import { Icons, SectionCard, KpiCard, SimpleBarChart, HorizontalBar, FilterChip, Badge, ProgressRing, StatusIndicator } from "./bo-shared";

type ForecastRange = "5yr" | "10yr";

const capexItems = [
  { asset: "HVAC Central Plant", year: 2027, cost: "$420,000", priority: "critical" as const, remaining: "38%", age: "18yr / 25yr" },
  { asset: "Elevator Modernization (x3)", year: 2028, cost: "$680,000", priority: "critical" as const, remaining: "28%", age: "22yr / 30yr" },
  { asset: "Roof Membrane Replacement", year: 2026, cost: "$185,000", priority: "high" as const, remaining: "60%", age: "15yr / 20yr" },
  { asset: "Parking Deck Resurfacing", year: 2027, cost: "$95,000", priority: "medium" as const, remaining: "45%", age: "12yr / 20yr" },
  { asset: "Fire Alarm System Upgrade", year: 2026, cost: "$72,000", priority: "high" as const, remaining: "25%", age: "18yr / 20yr" },
  { asset: "Lobby Renovation", year: 2029, cost: "$320,000", priority: "low" as const, remaining: "75%", age: "N/A" },
  { asset: "Boiler Replacement", year: 2030, cost: "$280,000", priority: "medium" as const, remaining: "55%", age: "16yr / 25yr" },
  { asset: "Window Seal Replacement", year: 2031, cost: "$410,000", priority: "medium" as const, remaining: "65%", age: "20yr / 30yr" },
];

const depreciationLedger = [
  { asset: "Boiler System A", originalValue: "$340,000", currentValue: "$136,000", depreciation: "60%", eol: "2030" },
  { asset: "Chiller Unit 1", originalValue: "$280,000", currentValue: "$168,000", depreciation: "40%", eol: "2032" },
  { asset: "Elevator Bank East", originalValue: "$520,000", currentValue: "$156,000", depreciation: "70%", eol: "2028" },
  { asset: "HVAC AHU-1", originalValue: "$180,000", currentValue: "$54,000", depreciation: "70%", eol: "2027" },
  { asset: "Generator (Backup)", originalValue: "$95,000", currentValue: "$57,000", depreciation: "40%", eol: "2033" },
  { asset: "Roof Membrane", originalValue: "$185,000", currentValue: "$74,000", depreciation: "60%", eol: "2026" },
];

const capexForecastChart = [
  { label: "2025", value: 0 },
  { label: "2026", value: 257, color: "bg-yellow-500/60" },
  { label: "2027", value: 515, color: "bg-red-500/60" },
  { label: "2028", value: 680, color: "bg-red-500/60" },
  { label: "2029", value: 320, color: "bg-yellow-500/60" },
  { label: "2030", value: 280, color: "bg-accent/60" },
  { label: "2031", value: 410, color: "bg-yellow-500/60" },
  { label: "2032", value: 150, color: "bg-accent/60" },
  { label: "2033", value: 85, color: "bg-accent/60" },
  { label: "2034", value: 120, color: "bg-accent/60" },
];

export default function AssetHealthTab() {
  const [forecastRange, setForecastRange] = useState<ForecastRange>("5yr");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");

  const filtered = priorityFilter === "all" ? capexItems : capexItems.filter((c) => c.priority === priorityFilter);
  const chartItems = forecastRange === "5yr" ? capexForecastChart.slice(0, 6) : capexForecastChart;
  const totalCapex5yr = "$1,452,000";
  const totalCapex10yr = "$2,817,000";

  return (
    <div className="space-y-6">
      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total CapEx (5yr)" value={totalCapex5yr} color="text-red-400" />
        <KpiCard label="Reserve Fund" value="$1.24M" change="+$42K this month" positive color="text-green-500" />
        <KpiCard label="Preventative Ratio" value="72%" change="+8% YoY" positive color="text-blue-500" />
        <KpiCard label="Reactive Ratio" value="28%" change="-8% YoY" positive color="text-yellow-500" />
      </div>

      {/* CapEx Forecast Chart */}
      <SectionCard
        title="CapEx Forecast"
        actions={
          <div className="flex items-center gap-1">
            {(["5yr", "10yr"] as ForecastRange[]).map((r) => (
              <FilterChip key={r} label={r === "5yr" ? "5 Year" : "10 Year"} active={forecastRange === r} onClick={() => setForecastRange(r)} />
            ))}
          </div>
        }
      >
        <div className="h-28">
          <SimpleBarChart data={chartItems} maxHeight={100} />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border/20 pt-3">
          <span className="font-mono text-[10px] text-muted-foreground">Total projected spend ({forecastRange})</span>
          <span className="font-[var(--font-bebas)] text-lg text-red-400">{forecastRange === "5yr" ? totalCapex5yr : totalCapex10yr}</span>
        </div>
      </SectionCard>

      {/* CapEx Items List */}
      <SectionCard
        title="Capital Expenditure Schedule"
        actions={
          <div className="flex items-center gap-1">
            {(["all", "critical", "high", "medium", "low"] as const).map((f) => (
              <FilterChip key={f} label={f} active={priorityFilter === f} onClick={() => setPriorityFilter(f)} />
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Asset</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Year</th>
                <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Cost</th>
                <th className="text-center py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Priority</th>
                <th className="text-center py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Life Remaining</th>
                <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Age</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={i} className="border-b border-border/10 hover:bg-accent/5 transition-colors">
                  <td className="py-2.5">{item.asset}</td>
                  <td className="py-2.5">{item.year}</td>
                  <td className="py-2.5 text-right font-semibold">{item.cost}</td>
                  <td className="py-2.5 text-center">
                    <Badge className={
                      item.priority === "critical" ? "border-red-500/40 text-red-500" :
                      item.priority === "high" ? "border-orange-500/40 text-orange-500" :
                      item.priority === "medium" ? "border-yellow-500/40 text-yellow-500" :
                      "border-border/40 text-muted-foreground"
                    }>
                      {item.priority}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-center">{item.remaining}</td>
                  <td className="py-2.5 text-right text-muted-foreground">{item.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Asset Depreciation Ledger */}
      <SectionCard title="Asset Depreciation Ledger" actions={<span className="text-muted-foreground">{Icons.download}</span>}>
        <div className="space-y-4">
          {depreciationLedger.map((asset, i) => (
            <div key={i} className="flex items-center gap-4 p-3 border border-border/20 rounded-md">
              <div className="relative flex items-center justify-center">
                <ProgressRing value={parseInt(asset.depreciation)} color={parseInt(asset.depreciation) >= 60 ? "stroke-red-500" : "stroke-accent"} />
                <span className="absolute font-mono text-[9px] font-bold">{asset.depreciation}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs font-medium truncate">{asset.asset}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="font-mono text-[10px] text-muted-foreground">Orig: {asset.originalValue}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">Book: {asset.currentValue}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">EOL: {asset.eol}</span>
                </div>
              </div>
              <StatusIndicator
                status={parseInt(asset.depreciation) >= 60 ? "red" : parseInt(asset.depreciation) >= 40 ? "yellow" : "green"}
                label={parseInt(asset.depreciation) >= 60 ? "Replace Soon" : parseInt(asset.depreciation) >= 40 ? "Monitor" : "Good"}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Preventative vs Reactive */}
      <SectionCard title="Preventative vs Reactive Maintenance">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <HorizontalBar label="Preventative" value={72} max={100} color="bg-green-500/60" suffix="%" />
            <HorizontalBar label="Reactive" value={28} max={100} color="bg-red-500/60" suffix="%" />
            <div className="pt-2 border-t border-border/20">
              <p className="font-mono text-[10px] text-muted-foreground">Industry Target: 80% Preventative</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-1">Current gap: 8% below target</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Monthly Trend</p>
            {[
              { month: "Oct", prev: 65, react: 35 },
              { month: "Nov", prev: 68, react: 32 },
              { month: "Dec", prev: 70, react: 30 },
              { month: "Jan", prev: 72, react: 28 },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground w-8">{m.month}</span>
                <div className="flex-1 flex h-3 rounded-full overflow-hidden">
                  <div className="bg-green-500/50" style={{ width: `${m.prev}%` }} />
                  <div className="bg-red-500/50" style={{ width: `${m.react}%` }} />
                </div>
                <span className="font-mono text-[10px] text-green-500 w-10 text-right">{m.prev}%</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

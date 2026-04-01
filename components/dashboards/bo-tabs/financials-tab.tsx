"use client";

import React, { useState } from "react";
import { Icons, SectionCard, KpiCard, SimpleBarChart, HorizontalBar, FilterChip, Badge } from "./bo-shared";

type Period = "monthly" | "quarterly" | "ytd";

const noiData = {
  monthly: { revenue: "$485,200", opex: "$312,400", noi: "$172,800", margin: "35.6%", change: "+2.1%" },
  quarterly: { revenue: "$1,442,600", opex: "$945,800", noi: "$496,800", margin: "34.4%", change: "+1.8%" },
  ytd: { revenue: "$5,652,400", opex: "$3,684,200", noi: "$1,968,200", margin: "34.8%", change: "+3.2%" },
};

const arrearsHeatmap = [
  { unit: "Unit 302", tenant: "J. Martinez", days: 90, amount: "$4,200", risk: "high" as const },
  { unit: "Unit 718", tenant: "A. Chen", days: 60, amount: "$2,800", risk: "high" as const },
  { unit: "Unit 1105", tenant: "R. Singh", days: 45, amount: "$2,100", risk: "medium" as const },
  { unit: "Unit 504", tenant: "L. Okafor", days: 30, amount: "$1,400", risk: "medium" as const },
  { unit: "Unit 215", tenant: "P. Williams", days: 15, amount: "$700", risk: "low" as const },
  { unit: "Unit 910", tenant: "N. Kowalski", days: 10, amount: "$700", risk: "low" as const },
];

const budgetCategories = [
  { category: "Utilities", budget: 84000, actual: 91200, variance: -7200 },
  { category: "Maintenance", budget: 62000, actual: 58400, variance: 3600 },
  { category: "Insurance", budget: 48000, actual: 48000, variance: 0 },
  { category: "Staffing", budget: 72000, actual: 74800, variance: -2800 },
  { category: "Marketing", budget: 18000, actual: 12400, variance: 5600 },
  { category: "Admin", budget: 28400, actual: 27600, variance: 800 },
];

const monthlyNoi = [
  { label: "Jan", value: 158 },
  { label: "Feb", value: 162 },
  { label: "Mar", value: 155 },
  { label: "Apr", value: 170 },
  { label: "May", value: 168 },
  { label: "Jun", value: 173 },
  { label: "Jul", value: 165 },
  { label: "Aug", value: 169 },
  { label: "Sep", value: 171 },
  { label: "Oct", value: 175 },
  { label: "Nov", value: 172 },
  { label: "Dec", value: 178 },
];

export default function FinancialsTab() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [arrearsFilter, setArrearsFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const noi = noiData[period];
  const filteredArrears = arrearsFilter === "all" ? arrearsHeatmap : arrearsHeatmap.filter((a) => a.risk === arrearsFilter);

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {(["monthly", "quarterly", "ytd"] as Period[]).map((p) => (
          <FilterChip key={p} label={p === "ytd" ? "Year-to-Date" : p.charAt(0).toUpperCase() + p.slice(1)} active={period === p} onClick={() => setPeriod(p)} />
        ))}
      </div>

      {/* NOI Tracker KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Gross Revenue" value={noi.revenue} color="text-green-500" />
        <KpiCard label="Operating Expenses" value={noi.opex} color="text-red-400" />
        <KpiCard label="Net Operating Income" value={noi.noi} change={noi.change} positive color="text-accent" />
        <KpiCard label="NOI Margin" value={noi.margin} color="text-blue-500" />
        <KpiCard label="Yield (Cap Rate)" value="6.8%" change="+0.3% YoY" positive color="text-purple-500" />
      </div>

      {/* NOI Trend Chart */}
      <SectionCard title="NOI Trend (Monthly, $K)" actions={<span className="text-muted-foreground">{Icons.download}</span>}>
        <div className="h-28">
          <SimpleBarChart data={monthlyNoi.map((d) => ({ ...d, color: d.value >= 170 ? "bg-green-500/60" : "bg-accent/50" }))} maxHeight={100} />
        </div>
      </SectionCard>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Arrears & Collections Heatmap */}
        <SectionCard
          title="Arrears & Collections"
          actions={
            <div className="flex items-center gap-1">
              {(["all", "high", "medium", "low"] as const).map((f) => (
                <FilterChip key={f} label={f} active={arrearsFilter === f} onClick={() => setArrearsFilter(f)} />
              ))}
            </div>
          }
        >
          <div className="space-y-2">
            {filteredArrears.map((a, i) => {
              const bg = a.risk === "high" ? "border-red-500/40 bg-red-500/5" : a.risk === "medium" ? "border-yellow-500/40 bg-yellow-500/5" : "border-border/40";
              return (
                <div key={i} className={`flex items-center justify-between p-3 border rounded-md ${bg}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${a.risk === "high" ? "bg-red-500" : a.risk === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />
                    <div>
                      <p className="font-mono text-xs">{a.unit} — {a.tenant}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{a.days} days overdue</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-semibold">{a.amount}</p>
                    <Badge className={a.risk === "high" ? "border-red-500/40 text-red-500" : a.risk === "medium" ? "border-yellow-500/40 text-yellow-500" : "border-green-500/40 text-green-500"}>
                      {a.risk}
                    </Badge>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-3 border-t border-border/20">
              <span className="font-mono text-[10px] text-muted-foreground">Total Outstanding</span>
              <span className="font-[var(--font-bebas)] text-lg text-red-400">$11,900</span>
            </div>
          </div>
        </SectionCard>

        {/* Budget vs Actuals */}
        <SectionCard title="Budget vs Actuals (Q4)">
          <div className="space-y-3">
            {budgetCategories.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px]">{cat.category}</span>
                  <span className={`font-mono text-[10px] ${cat.variance >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {cat.variance >= 0 ? "+" : ""}{(cat.variance / 1000).toFixed(1)}K
                  </span>
                </div>
                <div className="relative h-3 w-full bg-border/20 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-accent/30 rounded-full" style={{ width: `${(cat.budget / 100000) * 100}%` }} />
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${cat.actual > cat.budget ? "bg-red-500/50" : "bg-green-500/50"}`}
                    style={{ width: `${(cat.actual / 100000) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                  <span>Budget: ${(cat.budget / 1000).toFixed(0)}K</span>
                  <span>Actual: ${(cat.actual / 1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Yield / Dividend Monitoring */}
      <SectionCard title="Yield & Dividend Monitoring">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-border/20 rounded-lg">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Annual Yield</p>
            <p className="text-3xl font-[var(--font-bebas)] text-green-500 mt-1">6.8%</p>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">Target: 6.5%</p>
          </div>
          <div className="text-center p-4 border border-border/20 rounded-lg">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Quarterly Dividend</p>
            <p className="text-3xl font-[var(--font-bebas)] text-accent mt-1">$124,200</p>
            <p className="text-[10px] font-mono text-green-500 mt-1">+3.4% vs Q3</p>
          </div>
          <div className="text-center p-4 border border-border/20 rounded-lg">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Debt Service Ratio</p>
            <p className="text-3xl font-[var(--font-bebas)] text-blue-500 mt-1">1.42x</p>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">Min: 1.25x</p>
          </div>
          <div className="text-center p-4 border border-border/20 rounded-lg">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Cash-on-Cash Return</p>
            <p className="text-3xl font-[var(--font-bebas)] text-purple-500 mt-1">9.2%</p>
            <p className="text-[10px] font-mono text-green-500 mt-1">+0.6% YoY</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

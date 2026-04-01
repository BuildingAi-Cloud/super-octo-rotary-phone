"use client";

import React, { useState } from "react";
import { Icons, SectionCard, KpiCard, SimpleBarChart, HorizontalBar, FilterChip, Badge, StatusIndicator } from "./bo-shared";

const marketBenchmarks = [
  { metric: "Avg Rent / sqft", yours: "$3.42", market: "$3.18", delta: "+7.5%", favorable: true },
  { metric: "Occupancy Rate", yours: "96.4%", market: "93.8%", delta: "+2.6%", favorable: true },
  { metric: "Operating Expense / sqft", yours: "$1.86", market: "$1.72", delta: "+8.1%", favorable: false },
  { metric: "Cap Rate", yours: "6.8%", market: "6.2%", delta: "+0.6%", favorable: true },
  { metric: "Utility Cost / unit", yours: "$142", market: "$128", delta: "+10.9%", favorable: false },
  { metric: "Tenant Turnover Rate", yours: "11.8%", market: "14.2%", delta: "-2.4%", favorable: true },
  { metric: "Avg Days to Lease", yours: "18", market: "24", delta: "-25%", favorable: true },
  { metric: "Maintenance Cost / unit", yours: "$86", market: "$94", delta: "-8.5%", favorable: true },
];

const predictiveAlerts = [
  { asset: "HVAC AHU-1 (Floor 3-6)", prediction: "Compressor failure within 60 days", confidence: 87, severity: "critical" as const, action: "Schedule replacement", savingsIfPrevented: "$18,400" },
  { asset: "Elevator Bank East — Motor", prediction: "Bearing wear — service needed in 90 days", confidence: 74, severity: "high" as const, action: "Schedule inspection", savingsIfPrevented: "$42,000" },
  { asset: "Boiler System A", prediction: "Heat exchanger efficiency declining", confidence: 68, severity: "medium" as const, action: "Descale & inspect", savingsIfPrevented: "$8,200" },
  { asset: "Parking Level B1 — Lighting", prediction: "Ballast failure cluster (12 fixtures)", confidence: 82, severity: "low" as const, action: "Bulk replacement", savingsIfPrevented: "$2,100" },
  { asset: "Roof Membrane — Section C", prediction: "Leak risk increasing with UV degradation", confidence: 61, severity: "medium" as const, action: "Inspection + patch", savingsIfPrevented: "$14,600" },
];

const managementKpis = [
  { metric: "Ticket Resolution Time", value: "18.4h", target: "24h", score: 92, trend: "improving" as const },
  { metric: "Tenant Satisfaction", value: "4.2/5", target: "4.0/5", score: 88, trend: "stable" as const },
  { metric: "Move-In Velocity", value: "3.2 days", target: "5 days", score: 94, trend: "improving" as const },
  { metric: "Preventative Maintenance %", value: "72%", target: "80%", score: 72, trend: "improving" as const },
  { metric: "Budget Adherence", value: "97.2%", target: "95%", score: 90, trend: "stable" as const },
  { metric: "Vendor SLA Compliance", value: "89%", target: "95%", score: 68, trend: "declining" as const },
  { metric: "Communication Response Time", value: "2.1h", target: "4h", score: 95, trend: "improving" as const },
  { metric: "Amenity Utilization", value: "78%", target: "70%", score: 86, trend: "stable" as const },
];

const rentCompChart = [
  { label: "Studio", value: 1850, color: "bg-accent/60" },
  { label: "1BR", value: 2200, color: "bg-accent/60" },
  { label: "2BR", value: 3100, color: "bg-accent/60" },
  { label: "3BR", value: 4200, color: "bg-accent/60" },
  { label: "PH", value: 6800, color: "bg-accent/60" },
];

const marketRentChart = [
  { label: "Studio", value: 1720, color: "bg-muted-foreground/30" },
  { label: "1BR", value: 2050, color: "bg-muted-foreground/30" },
  { label: "2BR", value: 2880, color: "bg-muted-foreground/30" },
  { label: "3BR", value: 3900, color: "bg-muted-foreground/30" },
  { label: "PH", value: 6200, color: "bg-muted-foreground/30" },
];

export default function SmartInsightsTab() {
  const [benchmarkSort, setBenchmarkSort] = useState<"all" | "favorable" | "unfavorable">("all");

  const filteredBenchmarks = benchmarkSort === "all" ? marketBenchmarks : marketBenchmarks.filter((b) =>
    benchmarkSort === "favorable" ? b.favorable : !b.favorable
  );

  const overallMgmtScore = Math.round(managementKpis.reduce((sum, k) => sum + k.score, 0) / managementKpis.length);

  return (
    <div className="space-y-6">
      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Market Position" value="Top 15%" change="vs local comps" positive color="text-green-500" />
        <KpiCard label="Predictive Alerts" value={String(predictiveAlerts.length)} change="1 Critical" positive={false} color="text-yellow-500" />
        <KpiCard label="Mgmt Performance" value={`${overallMgmtScore}/100`} change="+3 pts QoQ" positive color="text-accent" />
        <KpiCard label="Potential Savings" value="$85,300" change="If preventative" positive color="text-blue-500" />
      </div>

      {/* Market Benchmarking */}
      <SectionCard
        title="Market Benchmarking"
        actions={
          <div className="flex items-center gap-1">
            {(["all", "favorable", "unfavorable"] as const).map((f) => (
              <FilterChip key={f} label={f} active={benchmarkSort === f} onClick={() => setBenchmarkSort(f)} />
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Metric</th>
                <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Your Building</th>
                <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Market Avg</th>
                <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Delta</th>
                <th className="text-center py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Position</th>
              </tr>
            </thead>
            <tbody>
              {filteredBenchmarks.map((b, i) => (
                <tr key={i} className="border-b border-border/10 hover:bg-accent/5 transition-colors">
                  <td className="py-2.5">{b.metric}</td>
                  <td className="py-2.5 text-right font-semibold">{b.yours}</td>
                  <td className="py-2.5 text-right text-muted-foreground">{b.market}</td>
                  <td className={`py-2.5 text-right ${b.favorable ? "text-green-500" : "text-red-500"}`}>{b.delta}</td>
                  <td className="py-2.5 text-center">
                    <StatusIndicator status={b.favorable ? "green" : "red"} label={b.favorable ? "Favorable" : "Unfavorable"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Rent Comparison Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <SectionCard title="Your Rents ($/mo)">
          <div className="h-28">
            <SimpleBarChart data={rentCompChart} maxHeight={100} />
          </div>
        </SectionCard>
        <SectionCard title="Market Avg Rents ($/mo)">
          <div className="h-28">
            <SimpleBarChart data={marketRentChart} maxHeight={100} />
          </div>
        </SectionCard>
      </div>

      {/* Predictive Maintenance Alerts */}
      <SectionCard title="Predictive Maintenance Alerts">
        <div className="space-y-2">
          {predictiveAlerts.map((alert, i) => {
            const sevBg =
              alert.severity === "critical" ? "border-red-500/30 bg-red-500/5" :
              alert.severity === "high" ? "border-orange-500/20" :
              "border-border/20";
            return (
              <div key={i} className={`p-4 border rounded-md ${sevBg}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                      alert.severity === "critical" ? "bg-red-500 animate-pulse" :
                      alert.severity === "high" ? "bg-orange-500" :
                      alert.severity === "medium" ? "bg-yellow-500" : "bg-gray-400"
                    }`} />
                    <div>
                      <p className="font-mono text-xs font-medium">{alert.asset}</p>
                      <p className="font-mono text-[10px] text-muted-foreground mt-1">{alert.prediction}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className="border-accent/40 text-accent">{alert.action}</Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">Confidence: {alert.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <Badge className={
                      alert.severity === "critical" ? "border-red-500/40 text-red-500" :
                      alert.severity === "high" ? "border-orange-500/40 text-orange-500" :
                      alert.severity === "medium" ? "border-yellow-500/40 text-yellow-500" :
                      "border-border/40 text-muted-foreground"
                    }>
                      {alert.severity}
                    </Badge>
                    <p className="font-mono text-[10px] text-green-500 mt-1">Saves {alert.savingsIfPrevented}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Management Performance Score */}
      <SectionCard title="Management Performance Score">
        <div className="mb-4 text-center p-4 border border-border/20 rounded-lg">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Overall Score</p>
          <p className={`text-5xl font-[var(--font-bebas)] mt-1 ${overallMgmtScore >= 80 ? "text-green-500" : overallMgmtScore >= 60 ? "text-yellow-500" : "text-red-500"}`}>
            {overallMgmtScore}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mt-1">/ 100</p>
        </div>
        <div className="space-y-3">
          {managementKpis.map((kpi, i) => (
            <div key={i} className="flex items-center gap-4 p-2 border-b border-border/10 last:border-0">
              <span className="font-mono text-[10px] flex-1 min-w-0 truncate">{kpi.metric}</span>
              <span className="font-mono text-xs font-medium w-16 text-right">{kpi.value}</span>
              <span className="font-mono text-[10px] text-muted-foreground w-14 text-right">T: {kpi.target}</span>
              <div className="w-16">
                <div className="h-2 w-full bg-border/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${kpi.score >= 80 ? "bg-green-500/60" : kpi.score >= 60 ? "bg-yellow-500/60" : "bg-red-500/60"}`}
                    style={{ width: `${kpi.score}%` }}
                  />
                </div>
              </div>
              <StatusIndicator
                status={kpi.trend === "improving" ? "green" : kpi.trend === "stable" ? "yellow" : "red"}
                label={kpi.trend}
              />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

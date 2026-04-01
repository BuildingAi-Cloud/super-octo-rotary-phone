"use client";

import React, { useState } from "react";
import { Icons, SectionCard, SimpleBarChart, FilterChip } from "./bm-shared";

type TimeRange = "7d" | "30d" | "90d";

export default function AnalyticsTab() {
  const [range, setRange] = useState<TimeRange>("30d");

  const kpis = {
    avgTicketClose: "18.4h",
    residentSatisfaction: "4.2/5",
    occupancyRate: "94%",
    moveInVelocity: "3.2 days",
    packageAvgPickup: "6.8h",
    violationRate: "2.1%",
  };

  const complaintData = [
    { label: "Noise", value: 12, color: "bg-red-500/60" },
    { label: "Plumb", value: 8, color: "bg-blue-500/60" },
    { label: "HVAC", value: 6, color: "bg-orange-500/60" },
    { label: "Elev", value: 5, color: "bg-yellow-500/60" },
    { label: "Elect", value: 4, color: "bg-purple-500/60" },
    { label: "Pest", value: 3, color: "bg-green-500/60" },
    { label: "Other", value: 7, color: "bg-gray-500/60" },
  ];

  const amenityUsageData = [
    { label: "Gym", value: 340 },
    { label: "Pool", value: 280 },
    { label: "BBQ", value: 95 },
    { label: "Party", value: 42 },
    { label: "Guest", value: 38 },
    { label: "Theater", value: 65 },
  ];

  const weeklyWorkOrders = [
    { label: "Mon", value: 5 },
    { label: "Tue", value: 8 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 6 },
    { label: "Fri", value: 9 },
    { label: "Sat", value: 2 },
    { label: "Sun", value: 1 },
  ];

  const monthlyMoves = [
    { label: "Oct", value: 4 },
    { label: "Nov", value: 6 },
    { label: "Dec", value: 3 },
    { label: "Jan", value: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Time range */}
      <div className="flex items-center gap-2">
        {(["7d", "30d", "90d"] as TimeRange[]).map((r) => (
          <FilterChip key={r} label={r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"} active={range === r} onClick={() => setRange(r)} />
        ))}
      </div>

      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Avg Ticket Close", value: kpis.avgTicketClose, color: "text-accent" },
          { label: "Resident Satisfaction", value: kpis.residentSatisfaction, color: "text-green-500" },
          { label: "Occupancy Rate", value: kpis.occupancyRate, color: "text-blue-500" },
          { label: "Move-In Velocity", value: kpis.moveInVelocity, color: "text-yellow-500" },
          { label: "Pkg Avg Pickup", value: kpis.packageAvgPickup, color: "text-purple-500" },
          { label: "Violation Rate", value: kpis.violationRate, color: "text-red-500" },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={`text-xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <SectionCard title="Top Complaints">
          <div className="h-28">
            <SimpleBarChart data={complaintData} maxHeight={100} />
          </div>
        </SectionCard>

        <SectionCard title="Peak Amenity Usage">
          <div className="h-28">
            <SimpleBarChart data={amenityUsageData} maxHeight={100} />
          </div>
        </SectionCard>

        <SectionCard title="Work Orders by Day">
          <div className="h-28">
            <SimpleBarChart data={weeklyWorkOrders} maxHeight={100} />
          </div>
        </SectionCard>

        <SectionCard title="Monthly Move Activity">
          <div className="h-28">
            <SimpleBarChart data={monthlyMoves} maxHeight={100} />
          </div>
        </SectionCard>
      </div>

      {/* Insights */}
      <SectionCard title="AI Insights">
        <div className="space-y-3">
          {[
            { icon: "📈", text: "Noise complaints up 40% in the last 30 days. Consider updating quiet hours enforcement or sending building-wide reminder.", color: "text-yellow-500" },
            { icon: "⏱️", text: "Average work order closure improved from 24h to 18.4h — a 23% improvement month-over-month.", color: "text-green-500" },
            { icon: "📦", text: "Package pickup times are trending up. 15% of packages now exceed 48h hold time. Consider adding SMS reminders.", color: "text-orange-500" },
            { icon: "🏠", text: "January move-in velocity is fastest this quarter at 3.2 days. Current checklist completion rate: 87%.", color: "text-blue-500" },
          ].map((insight, i) => (
            <div key={i} className="flex items-start gap-3 p-3 border border-border/20 rounded-md">
              <span className="text-lg">{insight.icon}</span>
              <p className={`text-xs font-mono leading-relaxed ${insight.color}`}>{insight.text}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

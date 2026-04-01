"use client";

import React, { useState } from "react";
import { Icons, SectionCard, KpiCard, SimpleBarChart, HorizontalBar, FilterChip, Badge, StatusIndicator } from "./bo-shared";

type LeaseView = "expiring" | "pipeline" | "all";

const vacancyData = {
  totalUnits: 248,
  occupied: 239,
  vacant: 9,
  occupancyRate: "96.4%",
  retentionRate: "88.2%",
  avgTurnoverDays: "18",
  monthlyChurn: "1.2%",
};

const unitBreakdown = [
  { type: "1BR", total: 80, occupied: 78, rate: "97.5%" },
  { type: "2BR", total: 96, occupied: 92, rate: "95.8%" },
  { type: "3BR", total: 48, occupied: 46, rate: "95.8%" },
  { type: "Penthouse", total: 12, occupied: 12, rate: "100%" },
  { type: "Studio", total: 12, occupied: 11, rate: "91.7%" },
];

const leasingPipeline = [
  { unit: "Unit 104 (Studio)", applicant: "M. Thompson", status: "application" as const, moveIn: "Apr 1", rent: "$1,850" },
  { unit: "Unit 612 (1BR)", applicant: "K. Nakamura", status: "screening" as const, moveIn: "Apr 15", rent: "$2,200" },
  { unit: "Unit 303 (2BR)", applicant: "D. Patel", status: "approved" as const, moveIn: "Mar 28", rent: "$3,100" },
  { unit: "Unit 918 (1BR)", applicant: "—", status: "vacant" as const, moveIn: "—", rent: "$2,150" },
  { unit: "Unit 1201 (3BR)", applicant: "—", status: "vacant" as const, moveIn: "—", rent: "$4,200" },
];

const expiringLeases = [
  { unit: "Unit 405", tenant: "R. Johnson", expiry: "Apr 30", term: "12mo", renewal: "likely" as const, rent: "$2,400" },
  { unit: "Unit 709", tenant: "S. Kim", expiry: "May 15", term: "12mo", renewal: "uncertain" as const, rent: "$2,800" },
  { unit: "Unit 210", tenant: "A. Garcia", expiry: "May 31", term: "24mo", renewal: "likely" as const, rent: "$1,950" },
  { unit: "Unit 1108", tenant: "B. Okonkwo", expiry: "Jun 15", term: "12mo", renewal: "unlikely" as const, rent: "$3,600" },
  { unit: "Unit 502", tenant: "J. Lee", expiry: "Jun 30", term: "12mo", renewal: "likely" as const, rent: "$2,600" },
  { unit: "Unit 815", tenant: "C. Müller", expiry: "Jul 31", term: "18mo", renewal: "uncertain" as const, rent: "$3,200" },
];

const occupancyTrend = [
  { label: "Jul", value: 94 },
  { label: "Aug", value: 94 },
  { label: "Sep", value: 95 },
  { label: "Oct", value: 95 },
  { label: "Nov", value: 96 },
  { label: "Dec", value: 96 },
  { label: "Jan", value: 96 },
  { label: "Feb", value: 96 },
  { label: "Mar", value: 96 },
];

export default function OccupancyTab() {
  const [leaseView, setLeaseView] = useState<LeaseView>("expiring");

  return (
    <div className="space-y-6">
      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KpiCard label="Occupancy Rate" value={vacancyData.occupancyRate} change="+2.1% YoY" positive color="text-green-500" />
        <KpiCard label="Vacant Units" value={String(vacancyData.vacant)} color="text-yellow-500" />
        <KpiCard label="Retention Rate" value={vacancyData.retentionRate} change="+1.4%" positive color="text-blue-500" />
        <KpiCard label="Avg Turnover" value={`${vacancyData.avgTurnoverDays} days`} color="text-accent" />
        <KpiCard label="Monthly Churn" value={vacancyData.monthlyChurn} color="text-orange-500" />
        <KpiCard label="WALT" value="4.2 yrs" change="Stable" positive color="text-purple-500" />
      </div>

      {/* Occupancy Trend */}
      <SectionCard title="Occupancy Trend (%)">
        <div className="h-28">
          <SimpleBarChart data={occupancyTrend.map((d) => ({ ...d, color: d.value >= 96 ? "bg-green-500/60" : "bg-yellow-500/60" }))} maxHeight={100} />
        </div>
      </SectionCard>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Unit Breakdown */}
        <SectionCard title="Unit Type Breakdown">
          <div className="space-y-3">
            {unitBreakdown.map((u, i) => (
              <div key={i} className="flex items-center justify-between p-2 border-b border-border/10 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-medium w-16">{u.type}</span>
                  <HorizontalBar label="" value={u.occupied} max={u.total} color={u.occupied === u.total ? "bg-green-500/60" : "bg-accent/60"} />
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="font-mono text-[10px] text-muted-foreground">{u.occupied}/{u.total}</span>
                  <span className="font-mono text-[10px] text-green-500 w-12 text-right">{u.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* WALT Breakdown */}
        <SectionCard title="Weighted Avg Lease Term (WALT)">
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-5xl font-[var(--font-bebas)] text-accent">4.2</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-1">YEARS WEIGHTED AVERAGE</p>
            </div>
            <div className="space-y-2">
              {[
                { label: "< 1 year remaining", count: 42, pct: 17 },
                { label: "1-2 years remaining", count: 68, pct: 28 },
                { label: "2-3 years remaining", count: 54, pct: 23 },
                { label: "3-5 years remaining", count: 48, pct: 20 },
                { label: "5+ years remaining", count: 27, pct: 12 },
              ].map((band, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-muted-foreground flex-1">{band.label}</span>
                  <span className="font-mono text-[10px] w-10 text-right">{band.count}</span>
                  <div className="w-24 ml-3 h-2 bg-border/20 rounded-full overflow-hidden">
                    <div className="h-full bg-accent/60 rounded-full" style={{ width: `${band.pct}%` }} />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground w-8 text-right">{band.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Leasing Pipeline / Expiring Leases */}
      <SectionCard
        title={leaseView === "expiring" ? "Expiring Leases (90 Days)" : leaseView === "pipeline" ? "Leasing Pipeline" : "All Lease Activity"}
        actions={
          <div className="flex items-center gap-1">
            {(["expiring", "pipeline", "all"] as LeaseView[]).map((v) => (
              <FilterChip key={v} label={v === "expiring" ? "Expiring" : v === "pipeline" ? "Pipeline" : "All"} active={leaseView === v} onClick={() => setLeaseView(v)} />
            ))}
          </div>
        }
      >
        {(leaseView === "expiring" || leaseView === "all") && (
          <div className="space-y-2 mb-4">
            {leaseView === "all" && <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Expiring Leases</p>}
            {expiringLeases.map((l, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-border/20 rounded-md hover:bg-accent/5 transition-colors">
                <div className="flex items-center gap-3">
                  <StatusIndicator
                    status={l.renewal === "likely" ? "green" : l.renewal === "uncertain" ? "yellow" : "red"}
                    label=""
                  />
                  <div>
                    <p className="font-mono text-xs">{l.unit} — {l.tenant}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">Expires: {l.expiry} • {l.term} term</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs">{l.rent}/mo</p>
                  <Badge className={
                    l.renewal === "likely" ? "border-green-500/40 text-green-500" :
                    l.renewal === "uncertain" ? "border-yellow-500/40 text-yellow-500" :
                    "border-red-500/40 text-red-500"
                  }>
                    {l.renewal}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        {(leaseView === "pipeline" || leaseView === "all") && (
          <div className="space-y-2">
            {leaseView === "all" && <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2 mt-4">Pipeline</p>}
            {leasingPipeline.map((p, i) => {
              const statusColor =
                p.status === "approved" ? "border-green-500/40 text-green-500" :
                p.status === "screening" ? "border-blue-500/40 text-blue-500" :
                p.status === "application" ? "border-yellow-500/40 text-yellow-500" :
                "border-border/40 text-muted-foreground";
              return (
                <div key={i} className="flex items-center justify-between p-3 border border-border/20 rounded-md hover:bg-accent/5 transition-colors">
                  <div>
                    <p className="font-mono text-xs">{p.unit}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{p.applicant} • Target: {p.moveIn}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="font-mono text-xs">{p.rent}/mo</span>
                    <Badge className={statusColor}>{p.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Icons, Badge, FilterBar, FilterChip, SearchInput, SectionCard, StatusDot, EmptyState } from "./bm-shared";

type VendorFilter = "all" | "compliant" | "expiring" | "non-compliant";

interface Vendor {
  id: string;
  name: string;
  service: string;
  contractStart: string;
  contractEnd: string;
  insuranceExpiry: string;
  insuranceStatus: "valid" | "expiring" | "expired";
  licenseStatus: "valid" | "expiring" | "expired";
  slaScore: number;
  responseTimeAvg: string;
  openTickets: number;
  contactEmail: string;
  contactPhone: string;
}

const VENDORS: Vendor[] = [
  { id: "V-001", name: "PlumbRight Inc.", service: "Plumbing", contractStart: "2024-03-01", contractEnd: "2025-03-01", insuranceExpiry: "2025-06-15", insuranceStatus: "valid", licenseStatus: "valid", slaScore: 94, responseTimeAvg: "2.1h", openTickets: 1, contactEmail: "ops@plumbright.com", contactPhone: "(555) 100-2001" },
  { id: "V-002", name: "HVAC Solutions", service: "HVAC", contractStart: "2024-01-15", contractEnd: "2025-01-15", insuranceExpiry: "2025-01-20", insuranceStatus: "expiring", licenseStatus: "valid", slaScore: 88, responseTimeAvg: "4.5h", openTickets: 1, contactEmail: "service@hvacsol.com", contactPhone: "(555) 200-3002" },
  { id: "V-003", name: "ElevatorCo Inc.", service: "Elevator Maintenance", contractStart: "2024-06-01", contractEnd: "2026-06-01", insuranceExpiry: "2025-09-30", insuranceStatus: "valid", licenseStatus: "valid", slaScore: 91, responseTimeAvg: "1.5h", openTickets: 1, contactEmail: "dispatch@elevatorco.com", contactPhone: "(555) 300-4003" },
  { id: "V-004", name: "ElectraCo", service: "Electrical", contractStart: "2024-04-01", contractEnd: "2025-04-01", insuranceExpiry: "2025-03-01", insuranceStatus: "valid", licenseStatus: "expiring", slaScore: 85, responseTimeAvg: "3.2h", openTickets: 1, contactEmail: "support@electraco.com", contactPhone: "(555) 400-5004" },
  { id: "V-005", name: "FloorPro LLC", service: "Flooring", contractStart: "2024-09-01", contractEnd: "2025-09-01", insuranceExpiry: "2025-08-15", insuranceStatus: "valid", licenseStatus: "valid", slaScore: 78, responseTimeAvg: "6.0h", openTickets: 1, contactEmail: "info@floorpro.com", contactPhone: "(555) 500-6005" },
  { id: "V-006", name: "AppliancePro", service: "Appliance Repair", contractStart: "2024-07-01", contractEnd: "2025-07-01", insuranceExpiry: "2024-12-31", insuranceStatus: "expired", licenseStatus: "valid", slaScore: 72, responseTimeAvg: "5.0h", openTickets: 1, contactEmail: "repair@appliancepro.com", contactPhone: "(555) 600-7006" },
  { id: "V-007", name: "CleanSweep Janitorial", service: "Janitorial", contractStart: "2024-01-01", contractEnd: "2025-12-31", insuranceExpiry: "2025-11-30", insuranceStatus: "valid", licenseStatus: "valid", slaScore: 96, responseTimeAvg: "0.5h", openTickets: 0, contactEmail: "hello@cleansweep.com", contactPhone: "(555) 700-8007" },
];

export default function VendorComplianceTab() {
  const [filter, setFilter] = useState<VendorFilter>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const getComplianceStatus = (v: Vendor): "compliant" | "expiring" | "non-compliant" => {
    if (v.insuranceStatus === "expired" || v.licenseStatus === "expired") return "non-compliant";
    if (v.insuranceStatus === "expiring" || v.licenseStatus === "expiring") return "expiring";
    return "compliant";
  };

  const filtered = VENDORS.filter((v) => {
    const cs = getComplianceStatus(v);
    if (filter !== "all" && cs !== filter) return false;
    return v.name.toLowerCase().includes(search.toLowerCase()) || v.service.toLowerCase().includes(search.toLowerCase());
  });

  const stats = {
    total: VENDORS.length,
    compliant: VENDORS.filter((v) => getComplianceStatus(v) === "compliant").length,
    expiring: VENDORS.filter((v) => getComplianceStatus(v) === "expiring").length,
    nonCompliant: VENDORS.filter((v) => getComplianceStatus(v) === "non-compliant").length,
    avgSla: Math.round(VENDORS.reduce((a, v) => a + v.slaScore, 0) / VENDORS.length),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Vendors", value: stats.total, color: "text-accent" },
          { label: "Compliant", value: stats.compliant, color: "text-green-500" },
          { label: "Expiring Soon", value: stats.expiring, color: "text-yellow-500" },
          { label: "Non-Compliant", value: stats.nonCompliant, color: "text-red-500" },
          { label: "Avg SLA Score", value: `${stats.avgSla}%`, color: "text-blue-500" },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <FilterBar>
        {(["all", "compliant", "expiring", "non-compliant"] as VendorFilter[]).map((f) => (
          <FilterChip key={f} label={f === "all" ? "All" : f === "non-compliant" ? "Non-Compliant" : f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
        ))}
        <SearchInput value={search} onChange={setSearch} placeholder="Search vendors..." />
      </FilterBar>

      <SectionCard title="Vendor Directory">
        {filtered.length === 0 ? (
          <EmptyState message="No vendors found" />
        ) : (
          <div className="space-y-2">
            {filtered.map((v) => {
              const cs = getComplianceStatus(v);
              return (
                <div key={v.id} className="border border-border/20 rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                    className="w-full flex items-center gap-4 p-3 hover:bg-card/50 transition-colors text-left"
                  >
                    <StatusDot status={cs === "compliant" ? "green" : cs === "expiring" ? "yellow" : "red"} />
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-sm font-medium">{v.name}</span>
                      <p className="text-xs text-muted-foreground font-mono">{v.service}</p>
                    </div>
                    <div className="text-right text-xs font-mono">
                      <p className="text-muted-foreground">SLA</p>
                      <p className={v.slaScore >= 90 ? "text-green-500" : v.slaScore >= 80 ? "text-yellow-500" : "text-red-500"}>{v.slaScore}%</p>
                    </div>
                    <div className="text-right text-xs font-mono">
                      <p className="text-muted-foreground">Resp Time</p>
                      <p>{v.responseTimeAvg}</p>
                    </div>
                    <Badge className={
                      cs === "compliant" ? "border-green-500/40 text-green-500" :
                      cs === "expiring" ? "border-yellow-500/40 text-yellow-500" :
                      "border-red-500/40 text-red-500"
                    }>
                      {cs}
                    </Badge>
                  </button>

                  {expanded === v.id && (
                    <div className="px-4 pb-4 pt-2 border-t border-border/20 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Contract Period</span>
                        <p className="mt-0.5">{v.contractStart} → {v.contractEnd}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Insurance Expiry</span>
                        <p className={`mt-0.5 ${v.insuranceStatus === "expired" ? "text-red-500" : v.insuranceStatus === "expiring" ? "text-yellow-500" : ""}`}>
                          {v.insuranceExpiry} ({v.insuranceStatus})
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">License</span>
                        <p className={`mt-0.5 ${v.licenseStatus === "expired" ? "text-red-500" : v.licenseStatus === "expiring" ? "text-yellow-500" : ""}`}>
                          {v.licenseStatus}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Open Tickets</span>
                        <p className="mt-0.5">{v.openTickets}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Email</span>
                        <p className="mt-0.5 text-accent">{v.contactEmail}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Phone</span>
                        <p className="mt-0.5">{v.contactPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Icons, Badge, FilterBar, FilterChip, SearchInput, SectionCard, EmptyState } from "./bm-shared";

type ViolationFilter = "all" | "open" | "warning" | "fined" | "paid" | "appealed";

interface Violation {
  id: string;
  unit: string;
  resident: string;
  type: "parking" | "noise" | "pet" | "trash" | "unauthorized-alteration" | "common-area" | "other";
  description: string;
  issuedAt: string;
  status: "open" | "warning" | "fined" | "paid" | "appealed";
  warningCount: number;
  fineAmount: number | null;
  paidAmount: number | null;
  dueDate: string | null;
  notes: string;
}

interface FinePolicyProfile {
  id: "strict" | "warning-first" | "warning-only";
  label: string;
  allowsFines: boolean;
  minWarningsBeforeFine: number;
  warningOnlyTypes: Violation["type"][];
  legalNote: string;
}

const FINE_POLICY_PROFILES: FinePolicyProfile[] = [
  {
    id: "strict",
    label: "Jurisdiction A (Bylaw Strict)",
    allowsFines: true,
    minWarningsBeforeFine: 1,
    warningOnlyTypes: ["other"],
    legalNote: "Fines are generally enforceable after documented notice, except discretionary categories.",
  },
  {
    id: "warning-first",
    label: "Jurisdiction B (Warning First)",
    allowsFines: true,
    minWarningsBeforeFine: 2,
    warningOnlyTypes: ["noise", "pet"],
    legalNote: "Most violations require at least two formal warnings before monetary penalties.",
  },
  {
    id: "warning-only",
    label: "Jurisdiction C (Warning Only)",
    allowsFines: false,
    minWarningsBeforeFine: 99,
    warningOnlyTypes: ["parking", "noise", "pet", "trash", "unauthorized-alteration", "common-area", "other"],
    legalNote: "Local rules prohibit monetary fines for tenancy violations; warnings and remediation only.",
  },
];

const VIOLATIONS: Violation[] = [
  { id: "VIO-001", unit: "22C", resident: "Emily Park", type: "noise", description: "Excessive noise after 11 PM — 3rd occurrence", issuedAt: "2025-01-14", status: "fined", warningCount: 2, fineAmount: 200, paidAmount: null, dueDate: "2025-01-28", notes: "Verbal warnings given on Jan 2 and Jan 8." },
  { id: "VIO-002", unit: "3D", resident: "David Kim", type: "parking", description: "Unauthorized vehicle in reserved spot P-14", issuedAt: "2025-01-13", status: "warning", warningCount: 1, fineAmount: null, paidAmount: null, dueDate: null, notes: "First offense. Verbal warning issued." },
  { id: "VIO-003", unit: "8A", resident: "Marcus Johnson", type: "pet", description: "Dog off-leash in lobby area", issuedAt: "2025-01-10", status: "fined", warningCount: 2, fineAmount: 150, paidAmount: 150, dueDate: "2025-01-24", notes: "" },
  { id: "VIO-004", unit: "15A", resident: "Amy Torres", type: "trash", description: "Garbage left in hallway outside unit", issuedAt: "2025-01-12", status: "open", warningCount: 0, fineAmount: null, paidAmount: null, dueDate: null, notes: "First report. Investigating." },
  { id: "VIO-005", unit: "7C", resident: "Jake Miller", type: "unauthorized-alteration", description: "Installed satellite dish on balcony without approval", issuedAt: "2025-01-08", status: "appealed", warningCount: 1, fineAmount: 500, paidAmount: null, dueDate: "2025-02-08", notes: "Resident claims they had verbal approval. Under review." },
  { id: "VIO-006", unit: "14B", resident: "Sarah Chen", type: "common-area", description: "Personal items stored in common hallway", issuedAt: "2025-01-11", status: "paid", warningCount: 1, fineAmount: 75, paidAmount: 75, dueDate: "2025-01-25", notes: "Items removed same day. Fine paid." },
  { id: "VIO-007", unit: "22D", resident: "Lisa Wang", type: "noise", description: "Music during quiet hours", issuedAt: "2025-01-13", status: "warning", warningCount: 1, fineAmount: null, paidAmount: null, dueDate: null, notes: "First offense." },
];

export default function ViolationsTab() {
  const [filter, setFilter] = useState<ViolationFilter>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<FinePolicyProfile["id"]>("warning-first");
  const [finePolicyEnabled, setFinePolicyEnabled] = useState(true);

  const activeProfile = FINE_POLICY_PROFILES.find((profile) => profile.id === profileId) || FINE_POLICY_PROFILES[1];

  const fineAllowedForViolation = (violation: Violation) => {
    if (!finePolicyEnabled) return false;
    if (!activeProfile.allowsFines) return false;
    if (activeProfile.warningOnlyTypes.includes(violation.type)) return false;
    return violation.warningCount >= activeProfile.minWarningsBeforeFine;
  };

  const policyOutcome = (violation: Violation) => {
    if (violation.status === "paid") return "Fine closed";
    if (violation.status === "appealed") return "Under appeal review";
    if (fineAllowedForViolation(violation)) return "Fine allowed by active policy";
    if (!finePolicyEnabled) return "Fine policy disabled (warning/remediation mode)";
    if (!activeProfile.allowsFines) return "Fine prohibited by local-law profile";
    if (activeProfile.warningOnlyTypes.includes(violation.type)) return "Violation category is warning-only by law";
    return `Warning stage (${violation.warningCount}/${activeProfile.minWarningsBeforeFine}) before fine eligibility`;
  };

  const filtered = VIOLATIONS.filter((v) => {
    if (filter !== "all" && v.status !== filter) return false;
    return (
      v.resident.toLowerCase().includes(search.toLowerCase()) ||
      v.unit.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  const stats = {
    total: VIOLATIONS.length,
    open: VIOLATIONS.filter((v) => v.status === "open" || v.status === "warning").length,
    fined: VIOLATIONS.filter((v) => v.status === "fined").length,
    warningOnly: VIOLATIONS.filter((v) => !fineAllowedForViolation(v) && v.status !== "paid").length,
    paid: VIOLATIONS.filter((v) => v.status === "paid" || (v.paidAmount && v.paidAmount > 0)).length,
    outstanding: VIOLATIONS.filter((v) => v.fineAmount && !v.paidAmount).reduce((sum, v) => sum + (v.fineAmount || 0), 0),
    collected: VIOLATIONS.reduce((sum, v) => sum + (v.paidAmount || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total Violations", value: stats.total, color: "text-accent" },
          { label: "Open / Warning", value: stats.open, color: "text-yellow-500" },
          { label: "Fined", value: stats.fined, color: "text-red-500" },
          { label: "Warning-Only", value: stats.warningOnly, color: "text-blue-500" },
          { label: "Outstanding", value: `$${stats.outstanding}`, color: "text-orange-500" },
          { label: "Collected", value: `$${stats.collected}`, color: "text-green-500" },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <FilterBar>
        {(["all", "open", "warning", "fined", "paid", "appealed"] as ViolationFilter[]).map((f) => (
          <FilterChip key={f} label={f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
        ))}
        <select
          value={profileId}
          onChange={(event) => setProfileId(event.target.value as FinePolicyProfile["id"])}
          className="bg-background border border-border/40 rounded-md px-3 py-1.5 font-mono text-xs"
          aria-label="Local law fine profile"
        >
          {FINE_POLICY_PROFILES.map((profile) => (
            <option key={profile.id} value={profile.id}>{profile.label}</option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2 px-2 py-1.5 border border-border/30 rounded-md text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <input type="checkbox" checked={finePolicyEnabled} onChange={(event) => setFinePolicyEnabled(event.target.checked)} />
          Fine Policy Enabled
        </label>
        <SearchInput value={search} onChange={setSearch} placeholder="Search violations..." />
      </FilterBar>

      <div className="border border-border/30 bg-card/20 px-3 py-2 rounded-md">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Policy Note</p>
        <p className="font-mono text-xs text-foreground mt-1">{activeProfile.legalNote}</p>
      </div>

      <SectionCard
        title="Violations & Fines"
        actions={
          <button type="button" className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-accent/40 text-accent hover:bg-accent/10 rounded-md transition-colors">
            {Icons.plus} Issue Violation
          </button>
        }
      >
        <p className="font-mono text-[10px] text-muted-foreground mb-3">
          Enforcement is warning-first and jurisdiction-aware. Monetary fines are optional and only suggested where allowed by the selected local-law profile.
        </p>
        {filtered.length === 0 ? (
          <EmptyState message="No violations found" />
        ) : (
          <div className="space-y-2">
            {filtered.map((v) => (
              <div key={v.id} className="border border-border/20 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-card/50 transition-colors text-left"
                >
                  <span className="text-xs font-mono text-accent w-16">{v.id}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium truncate">{v.description}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{v.resident} · Unit {v.unit}</p>
                  </div>
                  <Badge className="border-border/40 text-muted-foreground">{v.type}</Badge>
                  {!fineAllowedForViolation(v) && v.status !== "paid" && (
                    <Badge className="border-blue-500/40 text-blue-500">warning-first</Badge>
                  )}
                  {v.fineAmount && (
                    <span className="text-xs font-mono font-medium">${v.fineAmount}</span>
                  )}
                  <Badge className={
                    v.status === "paid" ? "border-green-500/40 text-green-500" :
                    v.status === "fined" ? "border-red-500/40 text-red-500" :
                    v.status === "appealed" ? "border-purple-500/40 text-purple-500" :
                    v.status === "warning" ? "border-yellow-500/40 text-yellow-500" :
                    "border-blue-500/40 text-blue-500"
                  }>
                    {v.status}
                  </Badge>
                </button>

                {expanded === v.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-border/20 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Issued</span>
                        <p className="mt-0.5">{v.issuedAt}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Due Date</span>
                        <p className="mt-0.5">{v.dueDate || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Warnings</span>
                        <p className="mt-0.5">{v.warningCount}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Fine</span>
                        <p className="mt-0.5">{v.fineAmount ? `$${v.fineAmount}` : "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Paid</span>
                        <p className={`mt-0.5 ${v.paidAmount ? "text-green-500" : ""}`}>{v.paidAmount ? `$${v.paidAmount}` : "—"}</p>
                      </div>
                    </div>
                    <div className="text-xs font-mono">
                      <span className="text-[10px] uppercase text-muted-foreground">Policy Outcome</span>
                      <p className="mt-0.5 text-muted-foreground">{policyOutcome(v)}</p>
                    </div>
                    {v.notes && (
                      <div className="text-xs font-mono">
                        <span className="text-[10px] uppercase text-muted-foreground">Notes</span>
                        <p className="mt-0.5 text-muted-foreground">{v.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import type { User } from "@/lib/auth-context";
import { DashboardHeader } from "./dashboard-header";
import { ScrambleText } from "@/components/scramble-text";

import CommunicationsTab from "./bm-tabs/communications-tab";
import OnboardingTab from "./bm-tabs/onboarding-tab";
import AmenitiesTab from "./bm-tabs/amenities-tab";
import PackagesTab from "./bm-tabs/packages-tab";
import VisitorsTab from "./bm-tabs/visitors-tab";
import KeysFobsTab from "./bm-tabs/keys-fobs-tab";
import WorkOrdersTab from "./bm-tabs/work-orders-tab";
import IncidentsTab from "./bm-tabs/incidents-tab";
import VendorComplianceTab from "./bm-tabs/vendor-compliance-tab";
import DocumentsTab from "./bm-tabs/documents-tab";
import AnalyticsTab from "./bm-tabs/analytics-tab";
import AccessControlTab from "./bm-tabs/access-control-tab";
import UserDirectoryTab from "./bm-tabs/user-directory-tab";
import GovernancePanel from "@/components/governance/GovernancePanel";
import IntegrationsHub from "./integrations-hub";

/* ─── Tab definitions grouped by section ─────────────────────────────────────── */
const TABS = [
  // Tenant Relations
  { id: "overview", label: "Overview", section: "Tenant Relations" },
  { id: "communications", label: "Comms Hub", section: "Tenant Relations" },
  { id: "onboarding", label: "Onboarding", section: "Tenant Relations" },
  { id: "amenities", label: "Amenities", section: "Tenant Relations" },
  // Operational Logistics
  { id: "packages", label: "Packages", section: "Operations" },
  { id: "visitors", label: "Visitors", section: "Operations" },
  { id: "keys", label: "Keys & Fobs", section: "Operations" },
  // Service & Maintenance
  { id: "work-orders", label: "Work Orders", section: "Service" },
  { id: "incidents", label: "Incidents", section: "Service" },
  { id: "vendors", label: "Vendors", section: "Service" },
  // Administration
  { id: "documents", label: "Documents", section: "Admin" },
  { id: "analytics", label: "Analytics", section: "Admin" },
  { id: "governance", label: "Governance", section: "Admin" },
  { id: "user-directory", label: "Users", section: "Admin" },
  // Security & Systems
  { id: "access-control", label: "Access & CCTV", section: "Security" },
  { id: "integrations", label: "Integrations", section: "Systems" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const SECTION_COLORS: Record<string, string> = {
  "Tenant Relations": "border-purple-500/40",
  Operations: "border-orange-500/40",
  Service: "border-yellow-500/40",
  Admin: "border-green-500/40",
  Security: "border-red-500/40",
  Systems: "border-blue-500/40",
};

/* ─── Overview data ──────────────────────────────────────────────────────────── */
const quickStats = [
  { label: "Leases Active", value: "184", detail: "96.4% occupancy" },
  { label: "Renewals Due", value: "12", detail: "next 90 days" },
  { label: "Open Work Orders", value: "23", detail: "5 urgent" },
  { label: "Packages Today", value: "47", detail: "12 pending pickup" },
  { label: "Active Visitors", value: "8", detail: "3 contractors" },
  { label: "Incidents", value: "2", detail: "this week" },
];

const leasingPipeline = [
  { unit: "Unit 1401", sqft: "1,250", status: "vacant", listed: "Mar 1", applications: 4, askingRent: "$3,200" },
  { unit: "Unit 807", sqft: "850", status: "notice_given", moveOut: "Apr 15", applications: 0, askingRent: "$2,400" },
  { unit: "Unit 302", sqft: "1,100", status: "in_negotiation", applications: 2, askingRent: "$2,900" },
];

const upcomingRenewals = [
  { unit: "Unit 1204", tenant: "J. Martinez", expires: "May 31", currentRent: "$2,800", proposedRent: "$2,940", status: "pending" },
  { unit: "Unit 605", tenant: "R. Chen", expires: "Jun 15", currentRent: "$2,200", proposedRent: "$2,310", status: "sent" },
  { unit: "Unit 902", tenant: "K. Williams", expires: "Jun 30", currentRent: "$3,100", proposedRent: "$3,255", status: "accepted" },
];

const shiftNotes = [
  { time: "11:00 AM", note: "FedEx delivery — 12 packages received, all scanned via ImageR", author: "Current Shift" },
  { time: "9:30 AM", note: "Contractor ABC Plumbing checked in for Unit 605 repair", author: "Current Shift" },
  { time: "8:00 AM", note: "Morning walkthrough complete — all areas clear", author: "Current Shift" },
];

const LEASE_STATUS_COLORS: Record<string, string> = {
  vacant: "bg-red-500/20 text-red-400",
  notice_given: "bg-yellow-500/20 text-yellow-400",
  in_negotiation: "bg-blue-500/20 text-blue-400",
};

const RENEWAL_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  sent: "bg-blue-500/20 text-blue-400",
  accepted: "bg-green-500/20 text-green-400",
};

/* ─── Overview Tab (PM-specific) ─────────────────────────────────────────────── */
function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickStats.map((stat, i) => (
          <div key={i} className="border border-border/40 bg-card/30 p-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{stat.label}</span>
            <p className="mt-2 font-[var(--font-bebas)] text-3xl">{stat.value}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{stat.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leasing Pipeline */}
        <div className="border border-border/40 bg-card/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">LEASING PIPELINE</h2>
            <span className="font-mono text-[10px] text-muted-foreground">{leasingPipeline.length} units</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Unit</th>
                  <th className="text-left py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Sq Ft</th>
                  <th className="text-left py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="text-left py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Apps</th>
                  <th className="text-right py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Asking</th>
                </tr>
              </thead>
              <tbody>
                {leasingPipeline.map((u) => (
                  <tr key={u.unit} className="border-b border-border/20">
                    <td className="py-2 font-mono text-xs">{u.unit}</td>
                    <td className="py-2 font-mono text-xs text-muted-foreground">{u.sqft}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${LEASE_STATUS_COLORS[u.status] ?? "bg-muted/40 text-muted-foreground"}`}>
                        {u.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2 font-mono text-xs text-muted-foreground">{u.applications}</td>
                    <td className="py-2 font-mono text-xs text-right">{u.askingRent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Renewals */}
        <div className="border border-border/40 bg-card/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">UPCOMING RENEWALS</h2>
            <span className="font-mono text-[10px] text-muted-foreground">{upcomingRenewals.length} due</span>
          </div>
          <div className="space-y-3">
            {upcomingRenewals.map((r) => (
              <div key={r.unit} className="border border-border/30 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs">{r.unit} — {r.tenant}</span>
                  <span className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${RENEWAL_STATUS_COLORS[r.status] ?? "bg-muted/40 text-muted-foreground"}`}>
                    {r.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
                  <span>Expires {r.expires}</span>
                  <span>{r.currentRent} → {r.proposedRent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shift Log */}
      <div className="border border-border/40 bg-card/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">SHIFT LOG</h2>
          <button className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">+ Add Note</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shiftNotes.map((note, i) => (
            <div key={i} className="border-l-2 border-accent/40 pl-3 py-1">
              <p className="font-mono text-[10px] text-accent mb-1">{note.time}</p>
              <p className="font-mono text-xs text-foreground/80">{note.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Tab renderer ───────────────────────────────────────────────────────────── */
function renderTab(tab: TabId) {
  switch (tab) {
    case "overview": return <OverviewTab />;
    case "communications": return <CommunicationsTab />;
    case "onboarding": return <OnboardingTab />;
    case "amenities": return <AmenitiesTab />;
    case "packages": return <PackagesTab />;
    case "visitors": return <VisitorsTab />;
    case "keys": return <KeysFobsTab />;
    case "work-orders": return <WorkOrdersTab />;
    case "incidents": return <IncidentsTab />;
    case "vendors": return <VendorComplianceTab />;
    case "documents": return <DocumentsTab />;
    case "analytics": return <AnalyticsTab />;
    case "governance": return <GovernancePanel />;
    case "user-directory": return <UserDirectoryTab />;
    case "access-control": return <AccessControlTab />;
    case "integrations": return <IntegrationsHub />;
    default: return null;
  }
}

/* ─── Main Dashboard ─────────────────────────────────────────────────────────── */
export function PropertyManagerDashboard({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const tabBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tabBarRef.current) return;
    const activeEl = tabBarRef.current.querySelector(`[data-tab="${activeTab}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  const activeSection = TABS.find((t) => t.id === activeTab)?.section || "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader user={user} />

      {/* ─── Title Banner ──────────────────────────────────────────── */}
      <div className="border-b border-border/30 bg-background/90 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-[var(--font-bebas)] text-2xl md:text-3xl tracking-tight">
              <ScrambleText text="PROPERTY MANAGER" duration={0.8} />
            </h1>
            <p className="font-mono text-[10px] text-muted-foreground">
              Tenant relations, leasing & administration — Welcome back, {user.name}
            </p>
          </div>
          <span className="hidden md:block font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border border-purple-500/40 text-purple-400">
            16 Tabs
          </span>
        </div>
      </div>

      {/* ─── Sticky Tab Bar ──────────────────────────────────────── */}
      <div className="sticky top-14 md:top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div
          ref={tabBarRef}
          className="flex overflow-x-auto scrollbar-hide gap-0.5 px-4 md:px-6 py-2"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const sectionColor = SECTION_COLORS[tab.section] || "border-border/40";
            return (
              <button
                key={tab.id}
                type="button"
                data-tab={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-mono uppercase tracking-wider rounded-md border transition-all whitespace-nowrap ${
                  isActive
                    ? "border-accent bg-accent/10 text-accent"
                    : `${sectionColor} text-muted-foreground hover:text-accent hover:border-accent/40`
                }`}
                title={tab.section}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Section indicator */}
        <div className="px-4 md:px-6 pb-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
            {activeSection}
          </span>
        </div>
      </div>

      {/* ─── Tab Content ─────────────────────────────────────────── */}
      <main className="px-4 md:px-6 py-6 max-w-[1440px] mx-auto">
        {renderTab(activeTab)}
      </main>
    </div>
  );
}

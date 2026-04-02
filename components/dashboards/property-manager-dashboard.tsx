"use client";

import React, { useState, useRef, useEffect } from "react";
import type { User } from "@/lib/auth-context";
import { ScrambleText } from "@/components/scramble-text";

import CommunicationsTab from "./bm-tabs/communications-tab";
import OnboardingTab from "./bm-tabs/onboarding-tab";
import AmenitiesTab from "./bm-tabs/amenities-tab";
import LeasingPipelineTab from "./bm-tabs/leasing-pipeline-tab";
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
  { id: "leasing-pipeline", label: "Leasing Pipeline", section: "Tenant Relations" },
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
// The PM overview mixes static operational context with a few interactive,
// locally persisted workflows such as renewals and shift notes.
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

type RenewalStatus = "pending" | "sent" | "accepted" | "declined";

interface RenewalItem {
  id: string;
  unit: string;
  tenant: string;
  expires: string;
  currentRent: string;
  proposedRent: string;
  status: RenewalStatus;
}

const RENEWALS_STORAGE_KEY = "buildsync_pm_upcoming_renewals";

const defaultUpcomingRenewals: RenewalItem[] = [
  { id: "ren-1", unit: "Unit 1204", tenant: "J. Martinez", expires: "May 31", currentRent: "$2,800", proposedRent: "$2,940", status: "pending" },
  { id: "ren-2", unit: "Unit 605", tenant: "R. Chen", expires: "Jun 15", currentRent: "$2,200", proposedRent: "$2,310", status: "sent" },
  { id: "ren-3", unit: "Unit 902", tenant: "K. Williams", expires: "Jun 30", currentRent: "$3,100", proposedRent: "$3,255", status: "accepted" },
];

type ShiftNoteStatus = "open" | "in_progress" | "done";
type ShiftNoteCategory = "ops" | "leasing" | "vendor" | "incident" | "admin";

interface ShiftNote {
  id: string;
  time: string;
  note: string;
  author: string;
  status: ShiftNoteStatus;
  category: ShiftNoteCategory;
  createdAt: string;
  updatedAt: string;
}

const SHIFT_NOTES_STORAGE_KEY = "buildsync_pm_shift_notes";

const defaultShiftNotes: ShiftNote[] = [
  {
    id: "note-1",
    time: "11:00 AM",
    note: "FedEx delivery — 12 packages received, all scanned via ImageR",
    author: "Current Shift",
    status: "open",
    category: "ops",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "note-2",
    time: "9:30 AM",
    note: "Contractor ABC Plumbing checked in for Unit 605 repair",
    author: "Current Shift",
    status: "in_progress",
    category: "vendor",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "note-3",
    time: "8:00 AM",
    note: "Morning walkthrough complete — all areas clear",
    author: "Current Shift",
    status: "done",
    category: "ops",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
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
  declined: "bg-red-500/20 text-red-400",
};

/* ─── Overview Tab (PM-specific) ─────────────────────────────────────────────── */
function OverviewTab() {
  // Renewals are stored separately so PMs can work the queue without affecting
  // the rest of the overview cards.
  const [renewals, setRenewals] = useState<RenewalItem[]>(defaultUpcomingRenewals);
  const [renewalFilter, setRenewalFilter] = useState<RenewalStatus | "all">("all");
  const [expandedRenewalId, setExpandedRenewalId] = useState<string | null>(null);

  // Shift notes act like a handoff log between PM shifts and are intentionally
  // capped to a small recent history in local storage.
  const [shiftNotes, setShiftNotes] = useState<ShiftNote[]>(defaultShiftNotes);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    try {
      // Rehydrate the interactive overview state from local storage so PMs keep
      // their renewal actions and handoff notes across refreshes.
      const storedRenewals = localStorage.getItem(RENEWALS_STORAGE_KEY);
      if (storedRenewals) {
        const parsed = JSON.parse(storedRenewals) as RenewalItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRenewals(parsed);
        }
      }

      const storedShiftNotes = localStorage.getItem(SHIFT_NOTES_STORAGE_KEY);
      if (storedShiftNotes) {
        const parsed = JSON.parse(storedShiftNotes) as ShiftNote[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setShiftNotes(parsed);
        }
      }
    } catch {
      // Keep defaults when local storage is unavailable.
    }
  }, []);

  const filteredRenewals = renewals.filter((r) => renewalFilter === "all" || r.status === renewalFilter);

  const persistRenewals = (next: RenewalItem[]) => {
    setRenewals(next);
    try {
      localStorage.setItem(RENEWALS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Non-blocking.
    }
  };

  const updateRenewalStatus = (id: string, status: RenewalStatus) => {
    // Renewal actions are intentionally expressed as status changes so the UI,
    // filters, and persistence layer all share the same source of truth.
    const next = renewals.map((r) => r.id === id ? { ...r, status } : r);
    persistRenewals(next);
  };

  const addShiftNote = () => {
    const note = noteDraft.trim();
    if (!note) return;

    const now = new Date();
    const next: ShiftNote[] = [
      {
        id: `note-${Date.now()}`,
        time: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        note,
        author: "Current Shift",
        status: "open",
        category: "ops",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      ...shiftNotes,
    ].slice(0, 20);

    setShiftNotes(next);
    setNoteDraft("");
    setShowAddNote(false);
    try {
      localStorage.setItem(SHIFT_NOTES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Non-blocking.
    }
  };

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
            <span className="font-mono text-[10px] text-muted-foreground">{renewals.filter((r) => r.status === "pending" || r.status === "sent").length} due</span>
          </div>

          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {(["all", "pending", "sent", "accepted", "declined"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setRenewalFilter(f)}
                className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded border transition-colors ${renewalFilter === f ? "border-accent text-accent bg-accent/10" : "border-border/40 text-muted-foreground hover:text-accent"}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredRenewals.map((r) => (
              <div key={r.id} className="border border-border/30 p-3">
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

                <div className="mt-2 pt-2 border-t border-border/20 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => updateRenewalStatus(r.id, "sent")}
                    className="px-2 py-0.5 text-[10px] font-mono border border-blue-500/40 text-blue-400 rounded hover:bg-blue-500/10 transition-colors"
                  >
                    Send Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRenewalStatus(r.id, "accepted")}
                    className="px-2 py-0.5 text-[10px] font-mono border border-green-500/40 text-green-400 rounded hover:bg-green-500/10 transition-colors"
                  >
                    Mark Accepted
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRenewalStatus(r.id, "declined")}
                    className="px-2 py-0.5 text-[10px] font-mono border border-red-500/40 text-red-400 rounded hover:bg-red-500/10 transition-colors"
                  >
                    Mark Declined
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedRenewalId((v) => v === r.id ? null : r.id)}
                    className="ml-auto px-2 py-0.5 text-[10px] font-mono border border-border/40 text-muted-foreground rounded hover:text-foreground transition-colors"
                  >
                    {expandedRenewalId === r.id ? "Hide" : "Details"}
                  </button>
                </div>

                {expandedRenewalId === r.id && (
                  <div className="mt-2 p-2 border border-border/20 rounded bg-background/50 font-mono text-[10px] text-muted-foreground">
                    Suggested next step: {r.status === "pending" ? "Contact tenant and send offer" : r.status === "sent" ? "Follow up in 48h" : r.status === "accepted" ? "Prepare renewal doc package" : "Start backfill leasing plan"}
                  </div>
                )}
              </div>
            ))}

            {filteredRenewals.length === 0 && (
              <div className="border border-border/20 p-3 text-center font-mono text-xs text-muted-foreground">
                No renewals in this filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shift Log */}
      <div className="border border-border/40 bg-card/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">SHIFT LOG</h2>
          <button
            type="button"
            onClick={() => setShowAddNote((v) => !v)}
            className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline"
          >
            {showAddNote ? "Close" : "+ Add Note"}
          </button>
        </div>

        {showAddNote && (
          <div className="mb-4 border border-border/30 rounded p-3 bg-background/50">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">New shift note</label>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={3}
              placeholder="Enter handover/operations update..."
              className="w-full border border-border/40 bg-background rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent/60"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={addShiftNote}
                className="px-3 py-1.5 border border-accent/40 bg-accent/10 text-accent text-[10px] font-mono uppercase tracking-widest rounded hover:bg-accent/20 transition-colors"
              >
                Save Note
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddNote(false);
                  setNoteDraft("");
                }}
                className="px-3 py-1.5 border border-border/40 text-muted-foreground text-[10px] font-mono uppercase tracking-widest rounded hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shiftNotes.map((note) => (
            <div key={note.id} className="border-l-2 border-accent/40 pl-3 py-1">
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
    case "leasing-pipeline": return <LeasingPipelineTab />;
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
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const sections = [...new Set(TABS.map((tab) => tab.section))];

  useEffect(() => {
    if (!tabBarRef.current) return;
    const activeEl = tabBarRef.current.querySelector(`[data-tab="${activeTab}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, tabs: readonly (typeof TABS)[number][], index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") {
      return;
    }

    event.preventDefault();

    let nextIndex = index;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    const nextTab = tabs[nextIndex];
    setActiveTab(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  };

  const activeSection = TABS.find((t) => t.id === activeTab)?.section || "";
  const visibleTabs = TABS.filter((tab) => tab.section === activeSection);

  const setSection = (section: string) => {
    const firstTab = TABS.find((tab) => tab.section === section);
    if (firstTab) {
      setActiveTab(firstTab.id);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            17 Tabs
          </span>
        </div>
      </div>

      {/* ─── Sticky Tab Bar ──────────────────────────────────────── */}
      <div className="sticky top-14 md:top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="flex overflow-x-auto scrollbar-hide gap-2 px-4 md:px-6 py-2 border-b border-border/20">
          {sections.map((section) => {
            const isActiveSection = activeSection === section;
            return (
              <button
                key={section}
                type="button"
                onClick={() => setSection(section)}
                className={`flex-shrink-0 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-md border transition-colors ${
                  isActiveSection
                    ? "border-accent text-accent bg-accent/10"
                    : "border-border/40 text-muted-foreground hover:text-accent hover:border-accent/40"
                }`}
              >
                {section}
              </button>
            );
          })}
        </div>

        <div
          ref={tabBarRef}
          role="tablist"
          aria-label="Property manager tabs"
          className="flex overflow-x-auto scrollbar-hide gap-1 px-4 md:px-6 pt-2"
        >
          {visibleTabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const sectionColor = SECTION_COLORS[tab.section] || "border-border/40";
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                data-tab={tab.id}
                id={`pm-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`pm-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, visibleTabs, index)}
                className={`flex-shrink-0 border-x border-t px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-mono uppercase tracking-wider rounded-t-md border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-accent border-b-background bg-background text-accent"
                    : `${sectionColor} border-b-border/40 bg-card/20 text-muted-foreground hover:text-accent hover:border-accent/40`
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
            {activeSection} • {visibleTabs.findIndex((tab) => tab.id === activeTab) + 1}/{visibleTabs.length}
          </span>
        </div>
      </div>

      {/* ─── Tab Content ─────────────────────────────────────────── */}
      <main
        id={`pm-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`pm-tab-${activeTab}`}
        className="px-4 md:px-6 py-6 max-w-[1440px] mx-auto"
      >
        {renderTab(activeTab)}
      </main>
    </div>
  );
}

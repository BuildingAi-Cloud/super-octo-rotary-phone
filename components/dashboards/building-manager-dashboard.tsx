"use client";

import React, { useState, useRef, useEffect } from "react";
import type { User } from "@/lib/auth-context";
import { DashboardHeader } from "./dashboard-header";

import OverviewTab from "./bm-tabs/overview-tab";
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
import ViolationsTab from "./bm-tabs/violations-tab";
import AnalyticsTab from "./bm-tabs/analytics-tab";
import AccessControlTab from "./bm-tabs/access-control-tab";
import UserDirectoryTab from "./bm-tabs/user-directory-tab";
import GovernancePanel from "@/components/governance/GovernancePanel";
import IntegrationsHub from "./integrations-hub";

/* ─── Tab definitions grouped by section ─────────────────────────────────────── */
const TABS = [
  // Overview (Super-User)
  { id: "overview", label: "Overview", section: "Overview" },
  // Resident & Tenant Experience
  { id: "communications", label: "Comms Hub", section: "Resident & Tenant" },
  { id: "onboarding", label: "Onboarding", section: "Resident & Tenant" },
  { id: "amenities", label: "Amenities", section: "Resident & Tenant" },
  // Operational Logistics
  { id: "packages", label: "Packages", section: "Operations" },
  { id: "visitors", label: "Visitors", section: "Operations" },
  { id: "keys", label: "Keys & Fobs", section: "Operations" },
  // Service & Maintenance
  { id: "work-orders", label: "Work Orders", section: "Service" },
  { id: "incidents", label: "Incidents", section: "Service" },
  { id: "vendors", label: "Vendors", section: "Service" },
  // Administrative & Financial
  { id: "documents", label: "Documents", section: "Admin" },
  { id: "violations", label: "Violations", section: "Admin" },
  { id: "analytics", label: "Analytics", section: "Admin" },
  { id: "governance", label: "Governance", section: "Admin" },
  { id: "user-directory", label: "Users", section: "Admin" },
  // Smart Access & Security
  { id: "access-control", label: "Access & CCTV", section: "Security" },
  // Systems
  { id: "integrations", label: "Integrations", section: "Systems" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const SECTION_COLORS: Record<string, string> = {
  Overview: "border-purple-500/40",
  "Resident & Tenant": "border-blue-500/40",
  Operations: "border-orange-500/40",
  Service: "border-yellow-500/40",
  Admin: "border-green-500/40",
  Security: "border-red-500/40",
  Systems: "border-cyan-500/40",
};

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
    case "violations": return <ViolationsTab />;
    case "analytics": return <AnalyticsTab />;
    case "governance": return <GovernancePanel />;
    case "user-directory": return <UserDirectoryTab />;
    case "access-control": return <AccessControlTab />;
    case "integrations": return <IntegrationsHub />;
    default: return null;
  }
}

export function BuildingManagerDashboard({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view on mount and on change
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
      <DashboardHeader user={user} role="building_manager" />

      {/* ─── Sticky Tab Bar ─────────────────────────────────── */}
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
                    ? `border-accent bg-accent/10 text-accent`
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

      {/* ─── Tab Content ──────────────────────────────────── */}
      <main className="px-4 md:px-6 py-6 max-w-[1440px] mx-auto">
        {renderTab(activeTab)}
      </main>
    </div>
  );
}

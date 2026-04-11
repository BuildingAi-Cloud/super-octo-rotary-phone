"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import type { User } from "@/lib/auth-context";
import { useStarterPlan } from "@/hooks/use-starter-plan";

import OverviewTab from "./bm-tabs/overview-tab";
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
import ViolationsTab from "./bm-tabs/violations-tab";
import AnalyticsTab from "./bm-tabs/analytics-tab";
import AccessControlTab from "./bm-tabs/access-control-tab";
import UserDirectoryTab from "./bm-tabs/user-directory-tab";
import GovernancePanel from "@/components/governance/GovernancePanel";
import IntegrationsHub from "./integrations-hub";
import { CommandCenterChrome } from "./command-center-chrome";

/* ─── Tab definitions grouped by section ─────────────────────────────────────── */
// This metadata drives both the section switcher and the inner tab rail, so
// adding a BM feature usually starts by registering it here.
const TABS = [
  // Overview (Super-User)
  { id: "overview", label: "Overview", section: "Overview" },
  // Resident & Tenant Experience
  { id: "communications", label: "Comms Hub", section: "Resident & Tenant" },
  { id: "onboarding", label: "Onboarding", section: "Resident & Tenant" },
  { id: "amenities", label: "Amenities", section: "Resident & Tenant" },
  { id: "leasing-pipeline", label: "Leasing Pipeline", section: "Resident & Tenant" },
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
  // Centralized tab-to-component mapping keeps the visible tab list and the
  // rendered panel aligned in one place.
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
    case "violations": return <ViolationsTab />;
    case "analytics": return <AnalyticsTab />;
    case "governance": return <GovernancePanel />;
    case "user-directory": return <UserDirectoryTab />;
    case "access-control": return <AccessControlTab />;
    case "integrations": return <IntegrationsHub />;
    default: return null;
  }
}

export function BuildingManagerDashboard({ user: __user }: { user: User }) {
  const plan = useStarterPlan();
  const isProfessional = plan === "professional";
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const enabledTabs = useMemo(
    () =>
      TABS.filter((tab) => {
        if (["keys", "access-control", "analytics", "integrations"].includes(tab.id)) {
          return isProfessional;
        }
        return true;
      }),
    [isProfessional],
  );

  useEffect(() => {
    if (!enabledTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(enabledTabs[0]?.id ?? "overview");
    }
  }, [enabledTabs, activeTab]);

  const sections = useMemo(() => [...new Set(enabledTabs.map((tab) => tab.section))], [enabledTabs]);

  // Scroll active tab into view on mount and on change
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

  // The active tab determines which section is highlighted and which subset of
  // tabs should be visible in the secondary tab rail.
  const activeSection = enabledTabs.find((t) => t.id === activeTab)?.section || sections[0] || "";
  const visibleTabs = enabledTabs.filter((tab) => tab.section === activeSection);

  const setSection = (section: string) => {
    // Switching sections always lands on the first tab in that section so the
    // panel never points at a hidden tab.
    const firstTab = enabledTabs.find((tab) => tab.section === section);
    if (firstTab) {
      setActiveTab(firstTab.id);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-4 md:px-6 pt-4 md:pt-6 max-w-[1440px] mx-auto">
        <CommandCenterChrome title="Buildsync Command Center" />
      </div>

      {/* ─── Sticky Tab Bar ─────────────────────────────────── */}
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
          aria-label="Building manager tabs"
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
                id={`bm-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`bm-panel-${tab.id}`}
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

      {/* ─── Tab Content ──────────────────────────────────── */}
      <main
        id={`bm-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`bm-tab-${activeTab}`}
        className="px-4 md:px-6 py-6 max-w-[1440px] mx-auto"
      >
        {renderTab(activeTab)}
      </main>
    </div>
  );
}

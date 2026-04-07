"use client";

import React, { useState } from "react";
import { type User } from "@/lib/auth-context";
import { AnimatedNoise } from "@/components/animated-noise";
import { ScrambleText } from "@/components/scramble-text";
import FinancialsTab from "./bo-tabs/financials-tab";
import AssetHealthTab from "./bo-tabs/asset-health-tab";
import OccupancyTab from "./bo-tabs/occupancy-tab";
import RiskComplianceTab from "./bo-tabs/risk-compliance-tab";
import SmartInsightsTab from "./bo-tabs/smart-insights-tab";
import OrgAdminPanel from "./org-admin-panel";

interface BuildingOwnerDashboardProps {
  user: User;
}

type TabId = "financials" | "asset-health" | "occupancy" | "risk-compliance" | "smart-insights" | "admin-panel";

interface TabDef {
  id: TabId;
  label: string;
  section: string;
}

const tabs: TabDef[] = [
  { id: "financials", label: "FINANCIALS", section: "Financial" },
  { id: "asset-health", label: "ASSET HEALTH", section: "Financial" },
  { id: "occupancy", label: "OCCUPANCY", section: "Portfolio" },
  { id: "risk-compliance", label: "RISK & COMPLIANCE", section: "Risk" },
  { id: "smart-insights", label: "SMART INSIGHTS", section: "Insights" },
  { id: "admin-panel", label: "TEAM", section: "Admin" },
];

// ─── Pulse Engine ────────────────────────────────────────────────────────────

type PulseStatus = "green" | "yellow" | "red";

interface PulseState {
  status: PulseStatus;
  label: string;
  detail: string;
}

function computePulse(): PulseState {
  // In production these would be derived from live data.
  // For now, static snapshot demonstrates the colour logic.
  const occupancy = 96.4;
  const noiMargin = 35.6;
  const insuranceExpiring = 1; // policies expiring within 30 days
  const criticalIncidents = 1;
  const budgetVariance = -2.3; // negative = over-budget %

  if (occupancy < 85 || criticalIncidents >= 3 || insuranceExpiring >= 2) {
    return { status: "red", label: "CRITICAL", detail: "High vacancy, critical failure, or expired insurance" };
  }
  if (budgetVariance < -5 || noiMargin < 25 || criticalIncidents >= 1 || insuranceExpiring >= 1) {
    return { status: "yellow", label: "ATTENTION", detail: "Budget overrun or major repair pending" };
  }
  return { status: "green", label: "HEALTHY", detail: "Profitable, systems healthy, fully compliant" };
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function BuildingOwnerDashboard({ user }: BuildingOwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("financials");
  const pulse = computePulse();

  const pulseColors: Record<PulseStatus, { ring: string; bg: string; text: string; glow: string }> = {
    green: { ring: "border-green-500", bg: "bg-green-500", text: "text-green-500", glow: "shadow-green-500/30" },
    yellow: { ring: "border-yellow-500", bg: "bg-yellow-500", text: "text-yellow-500", glow: "shadow-yellow-500/30" },
    red: { ring: "border-red-500", bg: "bg-red-500", text: "text-red-500", glow: "shadow-red-500/30" },
  };
  const pc = pulseColors[pulse.status];

  const renderTab = () => {
    switch (activeTab) {
      case "financials": return <FinancialsTab />;
      case "asset-health": return <AssetHealthTab />;
      case "occupancy": return <OccupancyTab />;
      case "risk-compliance": return <RiskComplianceTab />;
      case "smart-insights": return <SmartInsightsTab />;
      case "admin-panel": return <OrgAdminPanel user={user} />;
    }
  };

  return (
    <main className="relative min-h-screen bg-background">
      <AnimatedNoise opacity={0.02} />
      <div className="grid-bg fixed inset-0 opacity-20" aria-hidden="true" />

      <div className="relative z-10">
        {/* ── Pulse Banner ─────────────────────────────────────────────── */}
        <div className={`sticky top-14 md:top-16 z-40 border-b border-border/30 bg-background/90 backdrop-blur-md`}>
          <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-3 flex items-center gap-4">
            {/* Pulse circle */}
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 ${pc.ring} shadow-lg ${pc.glow}`}>
              <span className={`w-4 h-4 rounded-full ${pc.bg} ${pulse.status === "red" ? "animate-pulse" : ""}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-[var(--font-bebas)] text-2xl md:text-3xl tracking-tight">
                  <ScrambleText text="OWNER DASHBOARD" duration={0.8} />
                </h1>
                <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border rounded-sm ${pc.ring} ${pc.text}`}>
                  {pulse.label}
                </span>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground truncate">{pulse.detail}</p>
            </div>
            <div className="hidden md:block text-right">
              <p className="font-mono text-[10px] text-muted-foreground">Welcome back, {user.name}</p>
            </div>
          </div>
        </div>

        {/* ── Tab bar ──────────────────────────────────────────────────── */}
        <div className="sticky top-[6.75rem] md:top-[7.25rem] z-30 border-b border-border/30 bg-background/80 backdrop-blur-md">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
            <nav className="flex gap-1 overflow-x-auto scrollbar-hide py-1" aria-label="Dashboard tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap px-4 py-2 text-[10px] md:text-xs font-mono uppercase tracking-widest border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-accent text-accent"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* ── Tab content ─────────────────────────────────────────────── */}
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6">
          {renderTab()}
        </div>
      </div>
    </main>
  );
}

"use client"

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { type User } from "@/lib/auth-context";
import { AnimatedNoise } from "@/components/animated-noise";
import FacilityManagerSchedule from "@/components/dashboards/facility-manager-schedule";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

// ─── New FM Tab Imports ─────────────────────────────────────────────────────────
import { VendorsTab } from "./fm-tabs/vendors-tab";
import { ComplianceTab } from "./fm-tabs/compliance-tab";
import { AssetsTab } from "./fm-tabs/assets-tab";
import { SpaceTab } from "./fm-tabs/space-tab";
import { ReportsTab } from "./fm-tabs/reports-tab";
import { DocumentsTab } from "./fm-tabs/documents-tab";
import { WorkflowsTab } from "./fm-tabs/workflows-tab";
import { VendorDatabaseTab } from "./fm-tabs/vendor-database-tab";
import IntegrationsHub from "./integrations-hub";
import { CommandCenterChrome } from "./command-center-chrome";
import { useStarterPlan } from "@/hooks/use-starter-plan";

// ─── SVG Icons (inline, no dependency) ─────────────────────────────────────────
const Icons = {
  clipboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
  ),
  alert: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
  ),
  heart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
  ),
  wrench: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>
  ),
  server: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><circle cx="6" cy="6" r="1" /><circle cx="6" cy="18" r="1" /></svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  ),
  download: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
  ),
  filter: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
  ),
  plus: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
  ),
  search: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
  ),
  arrowRight: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
  ),
};

// ─── CONFIG ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "dashboard", label: "Overview", section: "Core" },
  { key: "work_orders", label: "Work Orders", section: "Core" },
  { key: "preventative_maintenance", label: "Preventative", section: "Core" },
  { key: "equipment_directory", label: "Equipment", section: "Core" },
  { key: "alerts", label: "IoT Alerts", section: "Core" },
  { key: "vendors", label: "Vendors", section: "Operations" },
  { key: "assets", label: "Assets", section: "Operations" },
  { key: "space", label: "Space", section: "Operations" },
  { key: "workflows", label: "Workflows", section: "Operations" },
  { key: "vendor_database", label: "Vendor DB", section: "Operations" },
  { key: "compliance", label: "Compliance", section: "Admin" },
  { key: "reports", label: "Reports", section: "Admin" },
  { key: "documents", label: "Documents", section: "Admin" },
  { key: "integrations", label: "Integrations", section: "Systems" },
  { key: "audit_log", label: "Audit Log", section: "Systems" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500/10 text-red-500 border-red-500/30",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  normal: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  low: "bg-green-500/10 text-green-500 border-green-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  scheduled: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  completed: "bg-green-500/10 text-green-500 border-green-500/30",
  closed: "bg-muted/40 text-muted-foreground border-border/30",
};

// ─── TYPES ──────────────────────────────────────────────────────────────────────
interface WorkOrder {
  id: number;
  priority: "urgent" | "high" | "normal" | "low";
  issue: string;
  unit: string;
  submitted: string;
  status: "open" | "in_progress" | "scheduled" | "completed" | "closed";
  vendor: string;
  assignee?: string;
}

interface PMTask {
  id: number;
  task: string;
  equipment: string;
  due: string;
  status: "due" | "upcoming" | "completed" | "overdue";
  lastCompleted?: string;
}

interface Equipment {
  id: number;
  name: string;
  type: string;
  location: string;
  health: number;
  status: "operational" | "maintenance_due" | "offline" | "critical";
  lastService?: string;
}

interface IoTAlert {
  id: number;
  severity: "critical" | "warning" | "info";
  device: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface AuditEntry {
  id: number;
  action: string;
  category: "work_order" | "equipment" | "maintenance" | "system" | "user" | "compliance";
  performedBy: string;
  timestamp: string;
  details?: string;
}

// ─── MOCK DATA ──────────────────────────────────────────────────────────────────
const MOCK_WORK_ORDERS: WorkOrder[] = [
  { id: 1001, priority: "urgent", issue: "Leaking pipe in basement", unit: "Unit 101", submitted: "2026-03-31", status: "open", vendor: "PlumbCo", assignee: "Mike" },
  { id: 1002, priority: "high", issue: "Broken AC unit", unit: "Unit 202", submitted: "2026-03-30", status: "in_progress", vendor: "HVAC Pros", assignee: "Sarah" },
  { id: 1003, priority: "normal", issue: "Light bulb replacement", unit: "Unit 303", submitted: "2026-03-29", status: "scheduled", vendor: "ElectriFix", assignee: "Tom" },
  { id: 1004, priority: "normal", issue: "Door hinge squeaking", unit: "Unit 104", submitted: "2026-03-28", status: "completed", vendor: "HandyHelp" },
  { id: 1005, priority: "high", issue: "Water heater malfunction", unit: "Unit 501", submitted: "2026-03-31", status: "open", vendor: "PlumbCo", assignee: "Mike" },
  { id: 1006, priority: "low", issue: "Touch-up paint lobby", unit: "Common Area", submitted: "2026-03-27", status: "scheduled", vendor: "PaintPros" },
];

const MOCK_PM_TASKS: PMTask[] = [
  { id: 1, task: "HVAC filter replacement", equipment: "Central HVAC", due: "2026-04-07", status: "due", lastCompleted: "2026-01-07" },
  { id: 2, task: "Elevator inspection", equipment: "Elevator A", due: "2026-04-15", status: "upcoming", lastCompleted: "2025-10-15" },
  { id: 3, task: "Fire alarm system test", equipment: "Fire Panel", due: "2026-04-01", status: "overdue", lastCompleted: "2025-10-01" },
  { id: 4, task: "Generator load test", equipment: "Backup Generator", due: "2026-04-20", status: "upcoming" },
  { id: 5, task: "Roof drain cleaning", equipment: "Roof Drainage", due: "2026-03-25", status: "completed", lastCompleted: "2026-03-25" },
];

const MOCK_EQUIPMENT: Equipment[] = [
  { id: 1, name: "Central Boiler", type: "HVAC", location: "Basement", health: 98, status: "operational", lastService: "2026-02-15" },
  { id: 2, name: "Elevator A", type: "Transport", location: "Main Lobby", health: 72, status: "maintenance_due", lastService: "2025-10-15" },
  { id: 3, name: "Backup Generator", type: "Power", location: "Rooftop", health: 100, status: "operational", lastService: "2026-01-10" },
  { id: 4, name: "Fire Pump", type: "Safety", location: "Basement", health: 95, status: "operational", lastService: "2026-03-01" },
  { id: 5, name: "Security Camera System", type: "Security", location: "Building-wide", health: 88, status: "operational", lastService: "2026-03-20" },
  { id: 6, name: "Water Heater #2", type: "Plumbing", location: "3rd Floor", health: 45, status: "critical", lastService: "2025-08-10" },
];

const MOCK_IOT_ALERTS: IoTAlert[] = [
  { id: 1, severity: "critical", device: "Water Heater #2", message: "Temperature exceeding safe limit (180\u00b0F)", timestamp: "2026-04-01 08:30", acknowledged: false },
  { id: 2, severity: "warning", device: "HVAC Zone 3", message: "Humidity level above 70%", timestamp: "2026-04-01 07:15", acknowledged: false },
  { id: 3, severity: "info", device: "Security Cam #4", message: "Motion detected in parking garage after hours", timestamp: "2026-03-31 23:45", acknowledged: true },
  { id: 4, severity: "warning", device: "Elevator A", message: "Unusual vibration detected", timestamp: "2026-03-31 15:20", acknowledged: false },
];

const MOCK_AUDIT_LOG: AuditEntry[] = [
  { id: 1, action: "Created work order #1005", category: "work_order", performedBy: "Facility Manager", timestamp: "2026-03-31 10:00", details: "Water heater malfunction - Unit 501" },
  { id: 2, action: "Updated equipment status", category: "equipment", performedBy: "Staff", timestamp: "2026-03-31 11:15", details: "Water Heater #2 set to Critical" },
  { id: 3, action: "Completed maintenance task", category: "maintenance", performedBy: "Facility Manager", timestamp: "2026-03-31 12:30", details: "Roof drain cleaning completed" },
  { id: 4, action: "IoT alert triggered", category: "system", performedBy: "System", timestamp: "2026-03-31 13:00", details: "Temperature alert - Water Heater #2" },
  { id: 5, action: "Acknowledged IoT alert", category: "system", performedBy: "Facility Manager", timestamp: "2026-03-31 13:05" },
  { id: 6, action: "User logged in", category: "user", performedBy: "Facility Manager", timestamp: "2026-03-31 09:00" },
  { id: 7, action: "Compliance check passed", category: "compliance", performedBy: "System", timestamp: "2026-03-30 17:00", details: "Fire safety inspection passed" },
  { id: 8, action: "Assigned vendor to WO #1002", category: "work_order", performedBy: "Facility Manager", timestamp: "2026-03-30 14:30", details: "HVAC Pros assigned" },
];

// ─── UTILITY COMPONENTS ─────────────────────────────────────────────────────────

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-sm ${className}`}>
      {children}
    </span>
  );
}

function StatTile({
  label,
  value,
  sub,
  icon,
  accent = "text-accent",
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group bg-card border border-border/40 rounded-lg p-4 md:p-5 flex flex-col text-left shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-200 w-full focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={`${label}: ${value}. ${sub ?? ""}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-md bg-muted/30 text-muted-foreground group-hover:text-accent transition-colors">{icon}</div>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">{Icons.arrowRight}</span>
      </div>
      <div className={`text-2xl md:text-3xl font-bold mb-1 ${accent}`}>{value}</div>
      <div className="font-mono text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      {sub && <div className="font-mono text-[10px] text-muted-foreground/70 mt-1">{sub}</div>}
    </button>
  );
}

function SectionCard({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="border border-border/40 bg-card/30 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border/20">
        <h2 className="font-[var(--font-bebas)] text-base md:text-lg tracking-wide uppercase">{title}</h2>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}

function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-muted-foreground">{Icons.filter}</span>
      {children}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-mono uppercase tracking-wider border transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border/40 text-muted-foreground hover:border-accent/40 hover:text-accent"
      }`}
    >
      {label}
    </button>
  );
}

function SearchInput({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative flex-1 min-w-[140px] max-w-xs">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">{Icons.search}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-background border border-border/40 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50"
      />
    </div>
  );
}

// ─── DASHBOARD TAB: OVERVIEW ────────────────────────────────────────────────────

function DashboardOverview({
  workOrders,
  pmTasks,
  equipment,
  iotAlerts,
  auditLog,
  onNavigateTab,
}: {
  workOrders: WorkOrder[];
  pmTasks: PMTask[];
  equipment: Equipment[];
  iotAlerts: IoTAlert[];
  auditLog: AuditEntry[];
  onNavigateTab: (tab: TabKey) => void;
}) {
  const openWOs = workOrders.filter((w) => w.status === "open" || w.status === "in_progress");
  const urgentWOs = workOrders.filter((w) => w.priority === "urgent" && w.status !== "completed" && w.status !== "closed");
  const overdueM = pmTasks.filter((t) => t.status === "overdue");
  const dueM = pmTasks.filter((t) => t.status === "due");
  const criticalEquip = equipment.filter((e) => e.status === "critical" || e.status === "maintenance_due");
  const avgHealth = Math.round(equipment.reduce((a, e) => a + e.health, 0) / (equipment.length || 1));
  const unackAlerts = iotAlerts.filter((a) => !a.acknowledged);
  const criticalAlerts = iotAlerts.filter((a) => a.severity === "critical" && !a.acknowledged);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatTile
          label="Open Requests"
          value={openWOs.length}
          sub={`${urgentWOs.length} urgent`}
          icon={Icons.clipboard}
          accent="text-accent"
          onClick={() => onNavigateTab("work_orders")}
        />
        <StatTile
          label="Scheduled Today"
          value={dueM.length + overdueM.length}
          sub={`${overdueM.length} overdue`}
          icon={Icons.calendar}
          accent={overdueM.length > 0 ? "text-red-500" : "text-foreground"}
          onClick={() => onNavigateTab("preventative_maintenance")}
        />
        <StatTile
          label="IoT Alerts"
          value={unackAlerts.length}
          sub={`${criticalAlerts.length} critical`}
          icon={Icons.alert}
          accent={criticalAlerts.length > 0 ? "text-red-500" : "text-yellow-500"}
          onClick={() => onNavigateTab("alerts")}
        />
        <StatTile
          label="Equipment Health"
          value={`${avgHealth}%`}
          sub={`${criticalEquip.length} need attention`}
          icon={Icons.heart}
          accent={avgHealth >= 90 ? "text-green-500" : avgHealth >= 70 ? "text-yellow-500" : "text-red-500"}
          onClick={() => onNavigateTab("equipment_directory")}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
        {([
          { label: "New Work Order", tab: "work_orders" as TabKey, icon: Icons.plus },
          { label: "Schedule Maintenance", tab: "preventative_maintenance" as TabKey, icon: Icons.wrench },
          { label: "View Equipment", tab: "equipment_directory" as TabKey, icon: Icons.server },
          { label: "Audit Report", tab: "audit_log" as TabKey, icon: Icons.shield },
        ]).map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onNavigateTab(action.tab)}
            className="flex items-center gap-2 px-3 py-2.5 border border-border/40 rounded-lg text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-accent hover:border-accent/40 transition-colors bg-card/50"
          >
            {action.icon}
            <span className="truncate">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main Grid: Recent WOs + Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <SectionCard
            title="Recent Work Orders"
            actions={
              <button
                type="button"
                onClick={() => onNavigateTab("work_orders")}
                className="text-[10px] font-mono uppercase tracking-wider text-accent hover:underline flex items-center gap-1"
              >
                View All {Icons.arrowRight}
              </button>
            }
          >
            <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">ID</th>
                    <th className="text-left py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Issue</th>
                    <th className="text-left py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Unit</th>
                    <th className="text-left py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Priority</th>
                    <th className="text-left py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.slice(0, 5).map((wo) => (
                    <tr key={wo.id} className="border-b border-border/10 hover:bg-muted/5">
                      <td className="py-2 font-mono text-xs text-muted-foreground">#{wo.id}</td>
                      <td className="py-2 font-mono text-xs text-foreground">{wo.issue}</td>
                      <td className="py-2 font-mono text-xs text-muted-foreground hidden sm:table-cell">{wo.unit}</td>
                      <td className="py-2"><Badge className={PRIORITY_COLORS[wo.priority]}>{wo.priority}</Badge></td>
                      <td className="py-2"><Badge className={STATUS_COLORS[wo.status]}>{wo.status.replace("_", " ")}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
        <div>
          <SectionCard title="Today&apos;s Schedule">
            <FacilityManagerSchedule />
          </SectionCard>
        </div>
      </div>

      {/* Secondary Grid: PM + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <SectionCard
          title="Upcoming Maintenance"
          actions={
            <button type="button" onClick={() => onNavigateTab("preventative_maintenance")} className="text-[10px] font-mono uppercase tracking-wider text-accent hover:underline flex items-center gap-1">
              View All {Icons.arrowRight}
            </button>
          }
        >
          <div className="space-y-2">
            {pmTasks.filter((t) => t.status !== "completed").slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                <div>
                  <div className="font-mono text-xs text-foreground">{task.task}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{task.equipment} &middot; Due {task.due}</div>
                </div>
                <Badge className={task.status === "overdue" ? "bg-red-500/10 text-red-500 border-red-500/30" : task.status === "due" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" : "bg-blue-500/10 text-blue-500 border-blue-500/30"}>
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Recent Activity"
          actions={
            <button type="button" onClick={() => onNavigateTab("audit_log")} className="text-[10px] font-mono uppercase tracking-wider text-accent hover:underline flex items-center gap-1">
              Full Log {Icons.arrowRight}
            </button>
          }
        >
          <div className="space-y-2">
            {auditLog.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-border/10 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <div className="font-mono text-xs text-foreground">{entry.action}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{entry.performedBy} &middot; {entry.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── WORK ORDERS TAB ────────────────────────────────────────────────────────────

function WorkOrdersTab({ orders: initialOrders }: { orders: WorkOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ issue: "", unit: "", vendor: "", priority: "normal" as string });
  const [formError, setFormError] = useState("");

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (priorityFilter !== "all" && o.priority !== priorityFilter) return false;
      if (search && !o.issue.toLowerCase().includes(search.toLowerCase()) && !o.unit.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [orders, statusFilter, priorityFilter, search]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.issue.trim() || !form.unit.trim() || !form.vendor.trim()) {
      setFormError("All fields are required.");
      return;
    }
    const newOrder: WorkOrder = {
      id: orders.length ? Math.max(...orders.map((o) => o.id)) + 1 : 1001,
      priority: form.priority as WorkOrder["priority"],
      issue: form.issue.trim(),
      unit: form.unit.trim(),
      vendor: form.vendor.trim(),
      submitted: new Date().toISOString().slice(0, 10),
      status: "open",
    };
    setOrders((prev) => [newOrder, ...prev]);
    setForm({ issue: "", unit: "", vendor: "", priority: "normal" });
    setFormError("");
    setDialogOpen(false);
  };

  const handleStatusChange = (id: number, newStatus: WorkOrder["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
  };

  const handleDownloadCSV = () => {
    const csv = [
      ["ID", "Issue", "Unit", "Priority", "Status", "Vendor", "Submitted"],
      ...filtered.map((o) => [o.id, o.issue, o.unit, o.priority, o.status, o.vendor, o.submitted]),
    ].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "work-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search work orders..." />
        <div className="flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-1 text-xs">{Icons.plus} New Work Order</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogTitle>Create Work Order</DialogTitle>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div>
                  <label htmlFor="wo-issue" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Issue</label>
                  <input id="wo-issue" value={form.issue} onChange={(e) => setForm((f) => ({ ...f, issue: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="wo-unit" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Unit</label>
                    <input id="wo-unit" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                  </div>
                  <div>
                    <label htmlFor="wo-priority" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Priority</label>
                    <select id="wo-priority" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none">
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="wo-vendor" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Vendor</label>
                  <input id="wo-vendor" value={form.vendor} onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                </div>
                {formError && <p className="text-red-500 text-xs">{formError}</p>}
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-1 text-xs" onClick={handleDownloadCSV}>{Icons.download} CSV</Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar>
        {["all", "open", "in_progress", "scheduled", "completed", "closed"].map((s) => (
          <FilterChip key={s} label={s === "all" ? "All Status" : s.replace("_", " ")} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
        <span className="w-px h-4 bg-border/40 mx-1" />
        {["all", "urgent", "high", "normal", "low"].map((p) => (
          <FilterChip key={p} label={p === "all" ? "All Priority" : p} active={priorityFilter === p} onClick={() => setPriorityFilter(p)} />
        ))}
      </FilterBar>

      {/* Table */}
      {filtered.length === 0 ? (
        <Empty>
          <p className="font-mono text-sm text-muted-foreground">No work orders match your filters.</p>
          <Button variant="default" onClick={() => setDialogOpen(true)} className="mt-2 gap-1">{Icons.plus} Create Work Order</Button>
        </Empty>
      ) : (
        <div className="overflow-x-auto border border-border/30 rounded-lg">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-muted/10 border-b border-border/30">
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">ID</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Issue</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Unit</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Priority</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hidden md:table-cell">Vendor</th>
                <th className="text-right py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((wo) => (
                <tr key={wo.id} className="border-b border-border/10 hover:bg-muted/5">
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground">#{wo.id}</td>
                  <td className="py-3 px-4 font-mono text-xs text-foreground max-w-[200px] truncate">{wo.issue}</td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground hidden sm:table-cell">{wo.unit}</td>
                  <td className="py-3 px-4"><Badge className={PRIORITY_COLORS[wo.priority]}>{wo.priority}</Badge></td>
                  <td className="py-3 px-4"><Badge className={STATUS_COLORS[wo.status]}>{wo.status.replace("_", " ")}</Badge></td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground hidden md:table-cell">{wo.vendor}</td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={wo.status}
                      onChange={(e) => handleStatusChange(wo.id, e.target.value as WorkOrder["status"])}
                      className="text-[10px] font-mono bg-background border border-border/40 rounded px-1.5 py-1 focus:ring-2 focus:ring-accent/50 focus:outline-none"
                      aria-label={`Change status for work order ${wo.id}`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="text-muted-foreground font-mono text-[10px] text-right">{filtered.length} of {orders.length} work orders</div>
    </div>
  );
}

// ─── PREVENTATIVE MAINTENANCE TAB ───────────────────────────────────────────────

function PreventativeMaintenanceTab({ tasks: initialTasks }: { tasks: PMTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ task: "", equipment: "", due: "" });

  const filtered = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  const handleComplete = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "completed" as const, lastCompleted: new Date().toISOString().slice(0, 10) } : t)));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.task.trim() || !form.equipment.trim() || !form.due) return;
    setTasks((prev) => [
      ...prev,
      { id: prev.length ? Math.max(...prev.map((t) => t.id)) + 1 : 1, task: form.task.trim(), equipment: form.equipment.trim(), due: form.due, status: "upcoming" as const },
    ]);
    setForm({ task: "", equipment: "", due: "" });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <FilterBar>
          {["all", "overdue", "due", "upcoming", "completed"].map((s) => (
            <FilterChip key={s} label={s === "all" ? "All" : s} active={filter === s} onClick={() => setFilter(s)} />
          ))}
        </FilterBar>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-1 text-xs shrink-0">{Icons.plus} Add Task</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogTitle>Schedule Maintenance Task</DialogTitle>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div>
                <label htmlFor="pm-task" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Task</label>
                <input id="pm-task" value={form.task} onChange={(e) => setForm((f) => ({ ...f, task: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
              </div>
              <div>
                <label htmlFor="pm-equip" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Equipment</label>
                <input id="pm-equip" value={form.equipment} onChange={(e) => setForm((f) => ({ ...f, equipment: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
              </div>
              <div>
                <label htmlFor="pm-due" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Due Date</label>
                <input id="pm-due" type="date" value={form.due} onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Schedule</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No maintenance tasks match your filter.</p></Empty>
      ) : (
        <div className="overflow-x-auto border border-border/30 rounded-lg">
          <table className="w-full min-w-[550px]">
            <thead>
              <tr className="bg-muted/10 border-b border-border/30">
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Task</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Equipment</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Due</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task.id} className="border-b border-border/10 hover:bg-muted/5">
                  <td className="py-3 px-4 font-mono text-xs text-foreground">{task.task}</td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground hidden sm:table-cell">{task.equipment}</td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{task.due}</td>
                  <td className="py-3 px-4">
                    <Badge className={task.status === "overdue" ? "bg-red-500/10 text-red-500 border-red-500/30" : task.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/30" : task.status === "due" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" : "bg-blue-500/10 text-blue-500 border-blue-500/30"}>
                      {task.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {task.status !== "completed" ? (
                      <button type="button" onClick={() => handleComplete(task.id)} className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
                        {Icons.check} Complete
                      </button>
                    ) : (
                      <span className="font-mono text-[10px] text-muted-foreground">Done {task.lastCompleted}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── EQUIPMENT DIRECTORY TAB ────────────────────────────────────────────────────

function EquipmentDirectoryTab({ equipment: initialEquipment }: { equipment: Equipment[] }) {
  const [equipment, setEquipment] = useState(initialEquipment);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "", location: "" });

  const filtered = useMemo(() => {
    return equipment.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.type.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [equipment, search, statusFilter]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.type.trim() || !form.location.trim()) return;
    setEquipment((prev) => [
      ...prev,
      { id: prev.length ? Math.max(...prev.map((eq) => eq.id)) + 1 : 1, name: form.name.trim(), type: form.type.trim(), location: form.location.trim(), health: 100, status: "operational" as const },
    ]);
    setForm({ name: "", type: "", location: "" });
    setDialogOpen(false);
  };

  function HealthBar({ value }: { value: number }) {
    const color = value >= 90 ? "bg-green-500" : value >= 70 ? "bg-yellow-500" : value >= 50 ? "bg-orange-500" : "bg-red-500";
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-muted/30 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">{value}%</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search equipment..." />
          {["all", "operational", "maintenance_due", "critical", "offline"].map((s) => (
            <FilterChip key={s} label={s === "all" ? "All" : s.replace("_", " ")} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
          ))}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-1 text-xs shrink-0">{Icons.plus} Add Equipment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogTitle>Add Equipment</DialogTitle>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div>
                <label htmlFor="eq-name" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Name</label>
                <input id="eq-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="eq-type" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Type</label>
                  <input id="eq-type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                </div>
                <div>
                  <label htmlFor="eq-location" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Location</label>
                  <input id="eq-location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Add</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No equipment found.</p></Empty>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((eq) => (
            <div key={eq.id} className="border border-border/30 rounded-lg p-4 bg-card/30 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-sm font-medium text-foreground">{eq.name}</h3>
                <Badge className={eq.status === "operational" ? "bg-green-500/10 text-green-500 border-green-500/30" : eq.status === "critical" ? "bg-red-500/10 text-red-500 border-red-500/30" : eq.status === "maintenance_due" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" : "bg-muted/40 text-muted-foreground border-border/30"}>
                  {eq.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mb-1">{eq.type} &middot; {eq.location}</div>
              <HealthBar value={eq.health} />
              {eq.lastService && <div className="font-mono text-[10px] text-muted-foreground mt-2">Last service: {eq.lastService}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── IOT ALERTS TAB ─────────────────────────────────────────────────────────────

function IoTAlertsTab({ alerts: initialAlerts }: { alerts: IoTAlert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return alerts;
    if (filter === "unacknowledged") return alerts.filter((a) => !a.acknowledged);
    return alerts.filter((a) => a.severity === filter);
  }, [alerts, filter]);

  const handleAcknowledge = (id: number) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  const handleAcknowledgeAll = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
  };

  const severityIcon: Record<string, string> = { critical: "bg-red-500", warning: "bg-yellow-500", info: "bg-blue-500" };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <FilterBar>
          {["all", "critical", "warning", "info", "unacknowledged"].map((s) => (
            <FilterChip key={s} label={s === "all" ? "All" : s} active={filter === s} onClick={() => setFilter(s)} />
          ))}
        </FilterBar>
        <Button variant="outline" className="text-xs shrink-0" onClick={handleAcknowledgeAll}>Acknowledge All</Button>
      </div>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No IoT alerts to show.</p></Empty>
      ) : (
        <div className="space-y-2">
          {filtered.map((alert) => (
            <div key={alert.id} className={`border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${alert.acknowledged ? "border-border/20 bg-card/20 opacity-60" : "border-border/40 bg-card/40"}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityIcon[alert.severity]}`} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={alert.severity === "critical" ? "bg-red-500/10 text-red-500 border-red-500/30" : alert.severity === "warning" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" : "bg-blue-500/10 text-blue-500 border-blue-500/30"}>
                      {alert.severity}
                    </Badge>
                    <span className="font-mono text-xs font-medium text-foreground">{alert.device}</span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground mt-1">{alert.message}</p>
                  <span className="font-mono text-[10px] text-muted-foreground/60">{alert.timestamp}</span>
                </div>
              </div>
              {!alert.acknowledged ? (
                <Button variant="outline" className="text-xs shrink-0 gap-1" onClick={() => handleAcknowledge(alert.id)}>{Icons.check} Acknowledge</Button>
              ) : (
                <span className="font-mono text-[10px] text-green-500 shrink-0">Acknowledged</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AUDIT LOG TAB ──────────────────────────────────────────────────────────────

function AuditLogTab({ entries: initialEntries }: { entries: AuditEntry[] }) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return initialEntries.filter((e) => {
      if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
      if (search && !e.action.toLowerCase().includes(search.toLowerCase()) && !e.performedBy.toLowerCase().includes(search.toLowerCase())) return false;
      if (dateFrom && e.timestamp < dateFrom) return false;
      if (dateTo && e.timestamp > dateTo + " 23:59") return false;
      return true;
    });
  }, [initialEntries, categoryFilter, search, dateFrom, dateTo]);

  const handleExport = () => {
    const csv = [
      ["ID", "Action", "Category", "Performed By", "Timestamp", "Details"],
      ...filtered.map((e) => [e.id, e.action, e.category, e.performedBy, e.timestamp, e.details ?? ""]),
    ].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const CATEGORY_COLORS: Record<string, string> = {
    work_order: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    equipment: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    maintenance: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    system: "bg-muted/40 text-muted-foreground border-border/30",
    user: "bg-green-500/10 text-green-500 border-green-500/30",
    compliance: "bg-teal-500/10 text-teal-500 border-teal-500/30",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search audit log..." />
          <Button variant="outline" className="gap-1 text-xs shrink-0" onClick={handleExport}>{Icons.download} Export CSV</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterBar>
            {["all", "work_order", "equipment", "maintenance", "system", "user", "compliance"].map((c) => (
              <FilterChip key={c} label={c === "all" ? "All" : c.replace("_", " ")} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
            ))}
          </FilterBar>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-border/40 px-2 py-1 rounded-md text-xs font-mono bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-border/40 px-2 py-1 rounded-md text-xs font-mono bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
          {(dateFrom || dateTo) && (
            <button type="button" onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-[10px] font-mono text-accent hover:underline">Clear dates</button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No audit entries match your filters.</p></Empty>
      ) : (
        <div className="overflow-x-auto border border-border/30 rounded-lg">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-muted/10 border-b border-border/30">
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Timestamp</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Action</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hidden md:table-cell">Performed By</th>
                <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-border/10 hover:bg-muted/5">
                  <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap">{entry.timestamp}</td>
                  <td className="py-3 px-4 font-mono text-xs text-foreground">{entry.action}</td>
                  <td className="py-3 px-4 hidden sm:table-cell"><Badge className={CATEGORY_COLORS[entry.category] ?? ""}>{entry.category.replace("_", " ")}</Badge></td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground hidden md:table-cell">{entry.performedBy}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">{entry.details ?? "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="text-muted-foreground font-mono text-[10px] text-right">{filtered.length} entries</div>
    </div>
  );
}

// ─── MAIN DASHBOARD ─────────────────────────────────────────────────────────────

export function FacilityManagerDashboard({ user }: { user: User }) {
  const plan = useStarterPlan();
  const isProfessional = plan === "professional";
  const iotEnabled = (user as User & { iotEnabled?: boolean }).iotEnabled !== false;
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const enabledTabs = useMemo(() => {
    return TABS.filter((tab) => {
      if (tab.key === "alerts" && !iotEnabled) return false;
      if (["vendor_database", "integrations", "audit_log", "reports"].includes(tab.key)) {
        return isProfessional;
      }
      return true;
    });
  }, [iotEnabled, isProfessional]);

  useEffect(() => {
    if (!enabledTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(enabledTabs[0]?.key ?? "dashboard");
    }
  }, [enabledTabs, activeTab]);

  const sections = useMemo(() => [...new Set(enabledTabs.map((tab) => tab.section))], [enabledTabs]);
  const activeSection = enabledTabs.find((tab) => tab.key === activeTab)?.section || sections[0] || "Core";
  const visibleTabs = enabledTabs.filter((tab) => tab.section === activeSection);

  const setSection = (section: string) => {
    const firstTab = enabledTabs.find((tab) => tab.section === section);
    if (firstTab) {
      setActiveTab(firstTab.key);
    }
  };

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
    setActiveTab(nextTab.key);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleNavigateTab = useCallback((tab: TabKey) => {
    if (!enabledTabs.some((entry) => entry.key === tab)) {
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [enabledTabs]);

  return (
    <main className="relative min-h-screen bg-background">
      <AnimatedNoise opacity={0.02} />
      <div className="grid-bg fixed inset-0 opacity-20 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10">
        <div className="max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8 pb-0">
          <CommandCenterChrome title="Facility Command Center" />
        </div>

        {/* Sticky Tab Bar */}
        <div className="sticky top-14 md:top-16 z-40 border-b border-border/30 bg-background/95 backdrop-blur-md">
          <div className="max-w-screen-2xl mx-auto overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max px-4 md:px-6 gap-2 py-2 border-b border-border/20">
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

            <nav className="flex min-w-max px-4 md:px-6" role="tablist" aria-label="Facility manager tabs">
              {visibleTabs.map((tab, index) => (
                <button
                  key={tab.key}
                  role="tab"
                  type="button"
                  aria-selected={activeTab === tab.key}
                  aria-controls={`tabpanel-${tab.key}`}
                  tabIndex={activeTab === tab.key ? 0 : -1}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  onKeyDown={(event) => handleTabKeyDown(event, visibleTabs, index)}
                  className={`py-3 px-3 md:px-4 font-mono text-[10px] md:text-xs uppercase tracking-widest border-b-2 transition-colors duration-200 whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-accent text-accent"
                      : "border-transparent text-muted-foreground hover:text-accent hover:border-accent/30"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="max-w-screen-2xl mx-auto px-4 md:px-6 pb-2">
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
              {activeSection} • {visibleTabs.findIndex((tab) => tab.key === activeTab) + 1}/{visibleTabs.length}
            </span>
          </div>
        </div>

        {/* Tab Content */}
        <div
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          className="max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8"
        >
          {activeTab === "dashboard" && (
            <DashboardOverview
              workOrders={MOCK_WORK_ORDERS}
              pmTasks={MOCK_PM_TASKS}
              equipment={MOCK_EQUIPMENT}
              iotAlerts={iotEnabled ? MOCK_IOT_ALERTS : []}
              auditLog={MOCK_AUDIT_LOG}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {activeTab === "work_orders" && (
            <WorkOrdersTab orders={MOCK_WORK_ORDERS} />
          )}

          {activeTab === "preventative_maintenance" && (
            <PreventativeMaintenanceTab tasks={MOCK_PM_TASKS} />
          )}

          {activeTab === "equipment_directory" && (
            <EquipmentDirectoryTab equipment={MOCK_EQUIPMENT} />
          )}

          {activeTab === "alerts" && iotEnabled && (
            <IoTAlertsTab alerts={MOCK_IOT_ALERTS} />
          )}

          {activeTab === "vendors" && <VendorsTab />}
          {activeTab === "compliance" && <ComplianceTab />}
          {activeTab === "assets" && <AssetsTab />}
          {activeTab === "space" && <SpaceTab />}
          {activeTab === "reports" && <ReportsTab />}
          {activeTab === "documents" && <DocumentsTab />}
          {activeTab === "workflows" && <WorkflowsTab />}
          {activeTab === "vendor_database" && <VendorDatabaseTab />}
          {activeTab === "integrations" && <IntegrationsHub />}

          {activeTab === "audit_log" && (
            <AuditLogTab entries={MOCK_AUDIT_LOG} />
          )}
        </div>
      </div>
    </main>
  );
}

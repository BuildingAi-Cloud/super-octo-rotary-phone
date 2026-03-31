"use client"

import React from "react";
import { type User } from "@/lib/auth-context";
import { DashboardHeader } from "./dashboard-header";
import { useTranslation } from "react-i18next";
import { AnimatedNoise } from "@/components/animated-noise";
import { ScrambleText } from "@/components/scramble-text";
import { AmenityManagement } from "@/components/amenity-management";

// --- CONFIG ---
const CONFIG = {
  TABS: [
    { key: "dashboard", label: "Dashboard" },
    { key: "amenities", label: "Amenities" },
    { key: "equipment", label: "Equipment" },
    { key: "alerts", label: "IoT Alerts" },
  ],
  STATUS_LABELS: {
    in_progress: "In Progress",
    scheduled: "Scheduled",
    completed: "Completed",
    due: "Due",
    upcoming: "Upcoming",
    operational: "Operational",
    maintenance_due: "Maintenance Due",
  },
  STAT_CARDS: [
    { label: "Open Requests", valueKey: "openRequests", color: "text-accent", sub: "3 urgent" },
    { label: "Scheduled Today", valueKey: "scheduledToday", color: "", sub: "2 preventative" },
    { label: "IoT Alerts", valueKey: "iotAlerts", color: "text-yellow-500", sub: "1 warning" },
    { label: "Equipment Health", valueKey: "equipmentHealth", color: "text-green-500", sub: "77/78 operational" },
  ],
};

// --- TYPES ---

interface FacilityManagerDashboardProps {
  user: User;
}
interface Tab {
  key: string;
  label: string;
}
interface StatCardProps {
  label: string;
  value: React.ReactNode;
  color?: string;
  sub?: string;
}
interface MaintenanceRequest {
  id: number;
  priority: "urgent" | "high" | "normal";
  issue: string;
  unit: string;
  submitted: string;
  status: "in_progress" | "scheduled" | "completed";
}
interface MaintenanceRequestListProps {
  requests: MaintenanceRequest[];
}
interface IoTAlert {
  id: number;
  message: string;
}
interface IoTAlertsProps {
  alerts: IoTAlert[];
}
interface PreventativeMaintenanceTask {
  id: number;
  task: string;
  due: string;
}
interface PreventativeMaintenanceTableProps {
  tasks: PreventativeMaintenanceTask[];
}
interface Asset {
  id: number;
  name: string;
  status: string;
}
interface EquipmentDirectoryProps {
  assets: Asset[];
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, sub }) => (
  <div className="bg-card border border-border rounded-lg p-4 flex flex-col shadow-md">
    <div className="font-mono text-xs text-muted-foreground mb-1">{label}</div>
    <div className={`text-3xl font-bold mb-2 ${color ?? ""}`}>{value}</div>
    {sub && <div className="font-mono text-[10px] text-muted-foreground">{sub}</div>}
  </div>
);

const MaintenanceRequestList: React.FC<MaintenanceRequestListProps> = ({ requests }) => (
  <>
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">WORK ORDERS</h2>
      <button className="px-3 py-1 border border-accent bg-accent/10 font-mono text-[10px] uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors">
        + New Work Order
      </button>
    </div>
    <div className="space-y-3">
      {requests.map((request) => (
        <div key={request.id} className="flex items-center justify-between border border-border/30 p-4">
          <div className="flex items-center gap-4">
            <span className={`h-2 w-2 ${
              request.priority === "urgent" ? "bg-red-500" :
              request.priority === "high" ? "bg-yellow-500" :
              request.priority === "normal" ? "bg-blue-500" : "bg-muted-foreground"
            }`} />
            <div>
              <p className="font-mono text-xs text-foreground">{request.issue}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{request.unit} • {request.submitted}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
              request.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
              request.status === "scheduled" ? "bg-green-500/20 text-green-400" :
              "bg-muted text-muted-foreground"
            }`}>
              {CONFIG.STATUS_LABELS[request.status]}
            </span>
            <button className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  </>
);

const IoTAlerts: React.FC<IoTAlertsProps> = ({ alerts }) => (
  <div className="space-y-2">
    {alerts.map((alert) => (
      <div key={alert.id} className="border border-border/30 p-4">
        <p className="font-mono text-xs text-foreground mb-2">{alert.message}</p>
      </div>
    ))}
  </div>
);

const PreventativeMaintenanceTable: React.FC<PreventativeMaintenanceTableProps> = ({ tasks }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-border/30">
          <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Task</th>
          <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Due</th>
          <th className="text-right py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Action</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id} className="border-b border-border/20">
            <td className="py-3 font-mono text-xs text-foreground">{task.task}</td>
            <td className="py-3 font-mono text-xs text-muted-foreground">{task.due}</td>
            <td className="py-3 text-right">
              <button className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
                Complete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const EquipmentDirectory: React.FC<EquipmentDirectoryProps> = ({ assets }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {assets.map((asset) => (
      <div key={asset.id} className="border border-border/30 p-4">
        <p className="font-mono text-xs text-foreground mb-2">{asset.name}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{asset.status}</p>
      </div>
    ))}
  </div>
);

export function FacilityManagerDashboard({ user }: { user: User }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState(CONFIG.TABS[0].key);

  // Demo/mock data
  const openRequests = 12;
  const scheduledToday = 5;
  const equipmentHealth = 98;
  const iotAlerts = [
    { id: 1, message: "Temperature high" },
    { id: 2, message: "Humidity low" },
  ];
  const maintenanceRequests: MaintenanceRequest[] = [
    { id: 1, priority: "urgent", issue: "Leaking pipe", unit: "Unit 101", submitted: "Today", status: "in_progress" },
    { id: 2, priority: "high", issue: "Broken AC", unit: "Unit 202", submitted: "Yesterday", status: "scheduled" },
    { id: 3, priority: "normal", issue: "Light bulb out", unit: "Unit 303", submitted: "2 days ago", status: "completed" },
  ];
  const preventativeMaintenance: PreventativeMaintenanceTask[] = [
    { id: 1, task: "HVAC filter replacement", due: "Next week" },
    { id: 2, task: "Elevator inspection", due: "Next month" },
  ];
  const assetInventory: Asset[] = [
    { id: 1, name: "Boiler", status: CONFIG.STATUS_LABELS.operational },
    { id: 2, name: "Elevator", status: CONFIG.STATUS_LABELS.maintenance_due },
  ];

  // Stat values for cards
  const statValues: Record<string, React.ReactNode> = {
    openRequests,
    scheduledToday,
    iotAlerts: iotAlerts.length,
    equipmentHealth: `${equipmentHealth}%`,
  };

  return (
    <main className="relative min-h-screen bg-background">
      <AnimatedNoise opacity={0.02} />
      <div className="grid-bg fixed inset-0 opacity-20" aria-hidden="true" />
      <div className="relative z-10">
        <DashboardHeader user={user} />
        {/* Tabs Navigation */}
        <div className="flex gap-2 md:gap-4 border-b border-border px-6 md:px-8 bg-background/80 sticky top-0 z-30">
          {CONFIG.TABS.map((tab) => (
            <button
              key={tab.key}
              className={`py-3 px-4 font-mono text-xs uppercase tracking-widest border-b-2 transition-colors duration-200 ${activeTab === tab.key ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-accent"}`}
              onClick={() => setActiveTab(tab.key)}
              aria-current={activeTab === tab.key ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <div>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 md:p-8">
              {CONFIG.STAT_CARDS.map((card) => (
                <StatCard
                  key={card.label}
                  label={card.label}
                  value={statValues[card.valueKey]}
                  color={card.color}
                  sub={card.sub}
                />
              ))}
            </div>
            {/* Main dashboard grid */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 border border-border/40 bg-card/30 p-6">
                  <MaintenanceRequestList requests={maintenanceRequests} />
                </div>
                <div className="border border-border/40 bg-card/30 p-6">
                  <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">IoT ALERTS</h2>
                  <IoTAlerts alerts={iotAlerts} />
                </div>
              </div>
              <div className="mt-6 border border-border/40 bg-card/30 p-6">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">PREVENTATIVE MAINTENANCE</h2>
                <PreventativeMaintenanceTable tasks={preventativeMaintenance} />
              </div>
              <div className="mt-6 border border-border/40 bg-card/30 p-6">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">EQUIPMENT DIRECTORY</h2>
                <EquipmentDirectory assets={assetInventory} />
              </div>
            </div>
          </div>
        )}
        {activeTab === "amenities" && (
          <div className="p-6 md:p-8">
            <AmenityManagement initialAmenities={[]} />
          </div>
        )}
        {activeTab !== "dashboard" && activeTab !== "amenities" && (
          <div className="p-6 md:p-8 text-muted-foreground font-mono">
            {CONFIG.TABS.find((t) => t.key === activeTab)?.label} coming soon...
          </div>
        )}
      </div>
    </main>
  );
}

"use client"

import { type User } from "@/lib/auth-context"
import { DashboardHeader } from "./dashboard-header"
import { AnimatedNoise } from "@/components/animated-noise"
import { ScrambleText } from "@/components/scramble-text"

interface FacilityManagerDashboardProps {
  user: User
}

const maintenanceRequests = [
  { id: 1, unit: "Unit 401", issue: "HVAC not cooling", priority: "urgent", status: "in_progress", submitted: "2h ago" },
  { id: 2, unit: "Unit 205", issue: "Leaking faucet in bathroom", priority: "normal", status: "pending", submitted: "5h ago" },
  { id: 3, unit: "Unit 802", issue: "Elevator noise complaint", priority: "high", status: "scheduled", submitted: "1d ago" },
  { id: 4, unit: "Common Area", issue: "Lobby light flickering", priority: "low", status: "pending", submitted: "2d ago" },
]

const preventativeMaintenance = [
  { task: "HVAC filter replacement - All units", due: "Today", equipment: "HVAC System", status: "due" },
  { task: "Fire alarm system test", due: "Tomorrow", equipment: "Fire Safety", status: "upcoming" },
  { task: "Elevator inspection - Car 1-3", due: "Mar 22", equipment: "Elevators", status: "scheduled" },
  { task: "Pool chemical balance check", due: "Mar 20", equipment: "Amenities", status: "scheduled" },
]

const iotAlerts = [
  { sensor: "Water Sensor B3", location: "Mechanical Room", alert: "Moisture detected", severity: "warning", time: "15 min ago" },
  { sensor: "HVAC Unit 12", location: "Floor 8", alert: "Efficiency below threshold", severity: "info", time: "2h ago" },
  { sensor: "Boiler Room", location: "Basement", alert: "Temperature normal", severity: "ok", time: "30 min ago" },
]

const assetInventory = [
  { name: "HVAC Units", total: 24, operational: 23, maintenance: 1 },
  { name: "Elevators", total: 4, operational: 4, maintenance: 0 },
  { name: "Fire Extinguishers", total: 48, operational: 48, maintenance: 0 },
  { name: "Generator", total: 2, operational: 2, maintenance: 0 },
]

export function FacilityManagerDashboard({ user }: FacilityManagerDashboardProps) {
  return (
    <main className="relative min-h-screen bg-background">
      <AnimatedNoise opacity={0.02} />
      <div className="grid-bg fixed inset-0 opacity-20" aria-hidden="true" />

      <div className="relative z-10">
        <DashboardHeader user={user} />

        <div className="p-6 md:p-8">
          {/* Welcome section */}
          <div className="mb-8">
            <h1 className="font-[var(--font-bebas)] text-4xl md:text-5xl tracking-tight">
              <ScrambleText text="MAINTENANCE & OPERATIONS" duration={0.8} />
            </h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              Welcome back, {user.name}. Manage work orders, equipment, and IoT alerts.
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="border border-border/40 bg-card/30 p-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Open Requests</span>
              <p className="mt-2 font-[var(--font-bebas)] text-3xl text-accent">12</p>
              <p className="font-mono text-[10px] text-muted-foreground">3 urgent</p>
            </div>
            <div className="border border-border/40 bg-card/30 p-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Scheduled Today</span>
              <p className="mt-2 font-[var(--font-bebas)] text-3xl">5</p>
              <p className="font-mono text-[10px] text-muted-foreground">2 preventative</p>
            </div>
            <div className="border border-border/40 bg-card/30 p-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">IoT Alerts</span>
              <p className="mt-2 font-[var(--font-bebas)] text-3xl text-yellow-500">2</p>
              <p className="font-mono text-[10px] text-muted-foreground">1 warning</p>
            </div>
            <div className="border border-border/40 bg-card/30 p-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Equipment Health</span>
              <p className="mt-2 font-[var(--font-bebas)] text-3xl text-green-500">98%</p>
              <p className="font-mono text-[10px] text-muted-foreground">77/78 operational</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Maintenance Requests */}
            <div className="lg:col-span-2 border border-border/40 bg-card/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">WORK ORDERS</h2>
                <button className="px-3 py-1 border border-accent bg-accent/10 font-mono text-[10px] uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors">
                  + New Work Order
                </button>
              </div>
              <div className="space-y-3">
                {maintenanceRequests.map((request) => (
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
                        {request.status.replace("_", " ")}
                      </span>
                      <button className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IoT Alerts - Aware Sensors */}
            <div className="border border-border/40 bg-card/30 p-6">
              <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">AWARE IOT ALERTS</h2>
              <div className="space-y-4">
                {iotAlerts.map((alert, index) => (
                  <div key={index} className="border-l-2 pl-4 py-2" style={{
                    borderColor: alert.severity === "warning" ? "rgb(234 179 8)" : 
                                 alert.severity === "ok" ? "rgb(34 197 94)" : "rgb(59 130 246)"
                  }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`h-1.5 w-1.5 ${
                        alert.severity === "warning" ? "bg-yellow-500 animate-pulse" : 
                        alert.severity === "ok" ? "bg-green-500" : "bg-blue-500"
                      }`} />
                      <p className="font-mono text-xs text-foreground">{alert.sensor}</p>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground">{alert.alert}</p>
                    <p className="font-mono text-[10px] text-muted-foreground/60">{alert.location} • {alert.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preventative Maintenance Schedule */}
          <div className="mt-6 border border-border/40 bg-card/30 p-6">
            <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">PREVENTATIVE MAINTENANCE</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Task</th>
                    <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Equipment</th>
                    <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Due</th>
                    <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="text-right py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {preventativeMaintenance.map((task, index) => (
                    <tr key={index} className="border-b border-border/20">
                      <td className="py-3 font-mono text-xs text-foreground">{task.task}</td>
                      <td className="py-3 font-mono text-xs text-muted-foreground">{task.equipment}</td>
                      <td className="py-3 font-mono text-xs text-muted-foreground">{task.due}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
                          task.status === "due" ? "bg-red-500/20 text-red-400" :
                          task.status === "upcoming" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {task.status}
                        </span>
                      </td>
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
          </div>

          {/* Asset Inventory */}
          <div className="mt-6 border border-border/40 bg-card/30 p-6">
            <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">EQUIPMENT DIRECTORY</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {assetInventory.map((asset, index) => (
                <div key={index} className="border border-border/30 p-4">
                  <p className="font-mono text-xs text-foreground mb-2">{asset.name}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-[var(--font-bebas)] text-2xl text-green-500">{asset.operational}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">/ {asset.total}</span>
                  </div>
                  {asset.maintenance > 0 && (
                    <p className="font-mono text-[10px] text-yellow-500 mt-1">{asset.maintenance} in maintenance</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

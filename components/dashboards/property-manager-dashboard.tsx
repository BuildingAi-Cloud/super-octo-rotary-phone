"use client"

import { type User } from "@/lib/auth-context"
import { DashboardHeader } from "./dashboard-header"
import { AnimatedNoise } from "@/components/animated-noise"
import { ScrambleText } from "@/components/scramble-text"
import { AmenityManagement } from "@/components/amenity-management"

interface PropertyManagerDashboardProps {
  user: User
}

const quickStats = [
  { label: "Packages Today", value: "47", detail: "12 pending pickup" },
  { label: "Active Visitors", value: "8", detail: "3 contractors" },
  { label: "Incidents", value: "2", detail: "this week" },
  { label: "Key Checkouts", value: "5", detail: "3 returned" },
]

const packageTracking = [
  { id: "PKG-4521", resident: "Unit 1204", carrier: "FedEx", status: "delivered", time: "10:32 AM", scanned: true },
  { id: "PKG-4520", resident: "Unit 803", carrier: "Amazon", status: "pending_pickup", time: "9:15 AM", scanned: true },
  { id: "PKG-4519", resident: "Unit 505", carrier: "UPS", status: "pending_pickup", time: "Yesterday", scanned: true },
  { id: "PKG-4518", resident: "Unit 302", carrier: "USPS", status: "picked_up", time: "Yesterday", scanned: true },
]

const visitorLog = [
  { name: "John Smith", visiting: "Unit 1204", type: "guest", checkedIn: "10:45 AM", status: "active" },
  { name: "ABC Plumbing", visiting: "Unit 605", type: "contractor", checkedIn: "9:00 AM", status: "active" },
  { name: "Sarah Johnson", visiting: "Unit 902", type: "guest", checkedIn: "11:30 AM", status: "active" },
]

const incidentReports = [
  { id: "INC-089", description: "Noise complaint - Unit 1105", reported: "Mar 18, 2:30 PM", status: "investigating", priority: "medium" },
  { id: "INC-088", description: "Unauthorized parking in visitor spot", reported: "Mar 17, 8:45 AM", status: "resolved", priority: "low" },
]

const keyLinkActivity = [
  { key: "Master - Floor 8", checkedOut: "John (Maintenance)", time: "9:15 AM", status: "out" },
  { key: "Pool Equipment", checkedOut: "Maria (Staff)", time: "8:00 AM", status: "out" },
  { key: "Mechanical Room", checkedOut: "-", time: "-", status: "available" },
  { key: "Roof Access", checkedOut: "-", time: "-", status: "available" },
]

const shiftNotes = [
  { time: "11:00 AM", note: "FedEx delivery - 12 packages received, all scanned via ImageR", author: "Current Shift" },
  { time: "9:30 AM", note: "Contractor ABC Plumbing checked in for Unit 605 repair", author: "Current Shift" },
  { time: "8:00 AM", note: "Morning walkthrough complete - all areas clear", author: "Current Shift" },
]

export function PropertyManagerDashboard({ user }: PropertyManagerDashboardProps) {
  // Example initial amenities
  const initialAmenities = [
    { id: "1", name: "Party Room", status: "available" },
    { id: "2", name: "Conference Room", status: "booked" },
    { id: "3", name: "BBQ Area", status: "maintenance" }
  ]
  return (
    <main className="relative min-h-screen bg-background">
      <AnimatedNoise opacity={0.02} />
      <div className="grid-bg fixed inset-0 opacity-20" aria-hidden="true" />

      <div className="relative z-10">
        <DashboardHeader user={user} />
        <AmenityManagement initialAmenities={initialAmenities} />

        <div className="p-6 md:p-8">
          {/* Welcome section */}
          <div className="mb-8">
            <h1 className="font-[var(--font-bebas)] text-4xl md:text-5xl tracking-tight">
              <ScrambleText text="CONCIERGE & FRONT DESK" duration={0.8} />
            </h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              Welcome back, {user.name}. Manage packages, visitors, and daily operations.
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="border border-border/40 bg-card/30 p-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                <p className="mt-2 font-[var(--font-bebas)] text-3xl">{stat.value}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{stat.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Package Tracking with ImageR */}
            <div className="lg:col-span-2 border border-border/40 bg-card/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">PACKAGE TRACKING</h2>
                  <span className="px-2 py-1 bg-accent/20 font-mono text-[10px] uppercase tracking-widest text-accent">
                    ImageR AI
                  </span>
                </div>
                <button className="px-3 py-1 border border-accent bg-accent/10 font-mono text-[10px] uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors">
                  + Scan Package
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">ID</th>
                      <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Resident</th>
                      <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Carrier</th>
                      <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                      <th className="text-right py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packageTracking.map((pkg) => (
                      <tr key={pkg.id} className="border-b border-border/20">
                        <td className="py-3 font-mono text-xs text-foreground">{pkg.id}</td>
                        <td className="py-3 font-mono text-xs text-muted-foreground">{pkg.resident}</td>
                        <td className="py-3 font-mono text-xs text-muted-foreground">{pkg.carrier}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
                            pkg.status === "pending_pickup" ? "bg-yellow-500/20 text-yellow-400" :
                            pkg.status === "delivered" ? "bg-blue-500/20 text-blue-400" :
                            "bg-green-500/20 text-green-400"
                          }`}>
                            {pkg.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
                            {pkg.status === "pending_pickup" ? "Notify" : "View"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visitor Log */}
            <div className="border border-border/40 bg-card/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">ACTIVE VISITORS</h2>
                <button className="px-3 py-1 border border-border/40 font-mono text-[10px] uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-colors">
                  + Check In
                </button>
              </div>
              <div className="space-y-3">
                {visitorLog.map((visitor, index) => (
                  <div key={index} className="border border-border/30 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-mono text-xs text-foreground">{visitor.name}</p>
                      <span className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                        visitor.type === "contractor" ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {visitor.type}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      Visiting {visitor.visiting} • In: {visitor.checkedIn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* KeyLink Management */}
            <div className="border border-border/40 bg-card/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">KEYLINK</h2>
                <span className="px-2 py-1 bg-green-500/20 font-mono text-[10px] uppercase tracking-widest text-green-400">
                  Biometric
                </span>
              </div>
              <div className="space-y-3">
                {keyLinkActivity.map((key, index) => (
                  <div key={index} className="flex items-center justify-between pb-3 border-b border-border/20 last:border-0">
                    <div>
                      <p className="font-mono text-xs text-foreground">{key.key}</p>
                      {key.status === "out" && (
                        <p className="font-mono text-[10px] text-muted-foreground">{key.checkedOut} • {key.time}</p>
                      )}
                    </div>
                    <span className={`h-2 w-2 ${key.status === "out" ? "bg-yellow-500" : "bg-green-500"}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Shift Log */}
            <div className="border border-border/40 bg-card/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">SHIFT LOG</h2>
                <button className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
                  + Add Note
                </button>
              </div>
              <div className="space-y-3">
                {shiftNotes.map((note, index) => (
                  <div key={index} className="border-l-2 border-accent/40 pl-3 py-1">
                    <p className="font-mono text-[10px] text-accent mb-1">{note.time}</p>
                    <p className="font-mono text-xs text-foreground/80">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Incident Reports */}
            <div className="border border-border/40 bg-card/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">INCIDENTS</h2>
                <button className="px-3 py-1 border border-red-500/40 bg-red-500/10 font-mono text-[10px] uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-colors">
                  + Report
                </button>
              </div>
              <div className="space-y-3">
                {incidentReports.map((incident) => (
                  <div key={incident.id} className="border border-border/30 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-muted-foreground">{incident.id}</span>
                      <span className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                        incident.status === "investigating" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-foreground">{incident.description}</p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-1">{incident.reported}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

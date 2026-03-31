"use client"

import { type User } from "@/lib/auth-context"
import { DashboardHeader } from "./dashboard-header"
import { AnimatedNoise } from "@/components/animated-noise"
import { ScrambleText } from "@/components/scramble-text"
import GovernancePanel from "@/components/governance/GovernancePanel"

interface BuildingOwnerDashboardProps {
  user: User
}

const residentStats = [
  { label: "Total Units", value: "248", detail: "12 floors" },
  { label: "Occupancy", value: "96.4%", detail: "+2.1% YoY" },
  { label: "Active Residents", value: "412", detail: "via portal" },
  { label: "Amenity Usage", value: "78%", detail: "this month" },
]

const recentAnnouncements = [
  { title: "Pool Maintenance Schedule", date: "Mar 18", views: 186, type: "maintenance" },
  { title: "New Gym Equipment Arriving", date: "Mar 15", views: 234, type: "amenity" },
  { title: "Annual Fire Drill Notice", date: "Mar 12", views: 298, type: "safety" },
]

const amenityBookings = [
  { amenity: "Party Room A", date: "Today", time: "6:00 PM - 10:00 PM", resident: "Unit 1204" },
  { amenity: "Guest Suite", date: "Mar 19-21", time: "Check-in 3PM", resident: "Unit 803" },
  { amenity: "Tennis Court 1", date: "Tomorrow", time: "9:00 AM - 11:00 AM", resident: "Unit 505" },
]

const financialOverview = [
  { metric: "Monthly Revenue", value: "$485,200", change: "+3.2%", positive: true },
  { metric: "Operating Expenses", value: "$312,400", change: "-1.8%", positive: true },
  { metric: "Delinquency Rate", value: "2.1%", change: "-0.5%", positive: true },
  { metric: "Reserve Fund", value: "$1.24M", change: "+$42K", positive: true },
]

export function BuildingOwnerDashboard({ user }: BuildingOwnerDashboardProps) {
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
              <ScrambleText text="OWNER DASHBOARD" duration={0.8} />
            </h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              Welcome back, {user.name}. Overview of your building performance and governance.
            </p>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {financialOverview.map((metric, index) => (
              <div key={index} className="border border-border/40 bg-card/30 p-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{metric.metric}</span>
                <p className="mt-2 font-[var(--font-bebas)] text-3xl">{metric.value}</p>
                <p className={`font-mono text-[10px] mt-1 ${metric.positive ? "text-green-500" : "text-red-500"}`}>
                  {metric.change}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Governance & E-Voting */}
            <div className="lg:col-span-2">
              <GovernancePanel />
            </div>

            {/* Resident Stats */}
            <div className="border border-border/40 bg-card/30 p-6">
              <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">RESIDENT METRICS</h2>
              <div className="space-y-4">
                {residentStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between pb-3 border-b border-border/20 last:border-0">
                    <span className="font-mono text-xs text-muted-foreground">{stat.label}</span>
                    <div className="text-right">
                      <p className="font-[var(--font-bebas)] text-xl">{stat.value}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{stat.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Announcements */}
            <div className="border border-border/40 bg-card/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">COMMUNICATIONS</h2>
                <button className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {recentAnnouncements.map((announcement, index) => (
                  <div key={index} className="flex items-center justify-between border border-border/30 p-4">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 ${
                        announcement.type === "safety" ? "bg-red-500" :
                        announcement.type === "maintenance" ? "bg-yellow-500" : "bg-blue-500"
                      }`} />
                      <div>
                        <p className="font-mono text-xs text-foreground">{announcement.title}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{announcement.date}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{announcement.views} views</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 border border-border/40 font-mono text-[10px] uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-colors">
                + New Announcement
              </button>
            </div>

            {/* Amenity Bookings */}
            <div className="border border-border/40 bg-card/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">AMENITY BOOKINGS</h2>
                <button className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
                  Manage
                </button>
              </div>
              <div className="space-y-3">
                {amenityBookings.map((booking, index) => (
                  <div key={index} className="border border-border/30 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-xs text-foreground">{booking.amenity}</p>
                      <span className="font-mono text-[10px] text-muted-foreground">{booking.resident}</span>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {booking.date} • {booking.time}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border/20">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-muted-foreground">This Week</span>
                  <span className="font-[var(--font-bebas)] text-lg">24 bookings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

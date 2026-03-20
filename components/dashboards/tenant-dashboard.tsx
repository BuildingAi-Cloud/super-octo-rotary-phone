"use client"

import { useState } from "react"
import { type User } from "@/lib/auth-context"
import { DashboardHeader } from "./dashboard-header"
import { AnimatedNoise } from "@/components/animated-noise"
import { ScrambleText } from "@/components/scramble-text"

interface TenantDashboardProps {
  user: User
}

const leaseInfo = {
  unit: "Suite 401",
  building: "Parkview Tower",
  startDate: "Jan 1, 2025",
  endDate: "Dec 31, 2025",
  monthlyRent: 2850,
  status: "active",
  nextPayment: "Apr 1, 2026",
  daysUntilDue: 14,
}

const paymentHistory = [
  { month: "March 2026", amount: 2850, status: "paid", date: "Mar 1", method: "Auto-pay" },
  { month: "February 2026", amount: 2850, status: "paid", date: "Feb 1", method: "Auto-pay" },
  { month: "January 2026", amount: 2850, status: "paid", date: "Jan 1", method: "Auto-pay" },
  { month: "December 2025", amount: 2850, status: "paid", date: "Dec 1", method: "Auto-pay" },
]

const serviceRequests = [
  { id: 1, type: "Maintenance", issue: "AC unit making noise", status: "scheduled", submitted: "Mar 15", scheduledDate: "Mar 20" },
  { id: 2, type: "Question", issue: "Parking permit renewal inquiry", status: "resolved", submitted: "Mar 10", resolvedDate: "Mar 11" },
]

const documents = [
  { name: "Lease Agreement", type: "PDF", date: "Jan 1, 2025", size: "2.4 MB" },
  { name: "Move-in Inspection", type: "PDF", date: "Jan 1, 2025", size: "1.1 MB" },
  { name: "Building Rules & Policies", type: "PDF", date: "Jan 1, 2025", size: "856 KB" },
  { name: "Parking Permit", type: "PDF", date: "Jan 1, 2025", size: "245 KB" },
]

const announcements = [
  { title: "Rent Payment Reminder", content: "Your next rent payment of $2,850 is due on April 1st.", date: "Today", priority: "reminder" },
  { title: "Building Maintenance", content: "Annual HVAC inspection scheduled for March 25th.", date: "Mar 14", priority: "info" },
]

export function TenantDashboard({ user }: TenantDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "requests" | "documents">("overview")

  return (
    <main className="relative min-h-screen bg-background">
      <AnimatedNoise opacity={0.02} />
      <div className="grid-bg fixed inset-0 opacity-20" aria-hidden="true" />

      <div className="relative z-10">
        <DashboardHeader user={user} />

        <div className="p-6 md:p-8">
          {/* Welcome section */}
          <div className="mb-6">
            <h1 className="font-[var(--font-bebas)] text-4xl md:text-5xl tracking-tight">
              <ScrambleText text="TENANT PORTAL" duration={0.8} />
            </h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              Welcome, {user.name}. Manage your lease, payments, and service requests.
            </p>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 mb-8 border-b border-border/40">
            {[
              { id: "overview", label: "Overview" },
              { id: "payments", label: "Payments" },
              { id: "requests", label: "Requests" },
              { id: "documents", label: "Documents" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${
                  activeTab === tab.id
                    ? "text-accent border-b-2 border-accent -mb-px"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <>
              {/* Lease summary card */}
              <div className="border border-accent/30 bg-accent/5 p-6 mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Your Unit</span>
                    <h2 className="font-[var(--font-bebas)] text-3xl tracking-wide text-accent">{leaseInfo.unit}</h2>
                    <p className="font-mono text-xs text-muted-foreground">{leaseInfo.building}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 font-mono text-[10px] uppercase tracking-widest">
                    {leaseInfo.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-accent/20">
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground">Lease Start</span>
                    <p className="font-mono text-xs text-foreground">{leaseInfo.startDate}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground">Lease End</span>
                    <p className="font-mono text-xs text-foreground">{leaseInfo.endDate}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground">Monthly Rent</span>
                    <p className="font-mono text-xs text-foreground">${leaseInfo.monthlyRent.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground">Next Payment</span>
                    <p className="font-mono text-xs text-accent">{leaseInfo.nextPayment}</p>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="border border-border/40 bg-card/30 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Due in</span>
                  <p className="mt-2 font-[var(--font-bebas)] text-3xl text-accent">{leaseInfo.daysUntilDue}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">days</p>
                </div>
                <div className="border border-border/40 bg-card/30 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Amount Due</span>
                  <p className="mt-2 font-[var(--font-bebas)] text-3xl">${leaseInfo.monthlyRent.toLocaleString()}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">Auto-pay enabled</p>
                </div>
                <div className="border border-border/40 bg-card/30 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Open Requests</span>
                  <p className="mt-2 font-[var(--font-bebas)] text-3xl">1</p>
                  <p className="font-mono text-[10px] text-muted-foreground">Scheduled</p>
                </div>
                <div className="border border-border/40 bg-card/30 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Lease Term</span>
                  <p className="mt-2 font-[var(--font-bebas)] text-3xl text-green-500">75%</p>
                  <p className="font-mono text-[10px] text-muted-foreground">9 months remaining</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Announcements */}
                <div className="border border-border/40 bg-card/30 p-6">
                  <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">ANNOUNCEMENTS</h2>
                  <div className="space-y-4">
                    {announcements.map((announcement, index) => (
                      <div key={index} className={`border-l-2 pl-4 py-2 ${
                        announcement.priority === "reminder" ? "border-accent" : "border-border"
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-mono text-xs text-foreground">{announcement.title}</p>
                          <span className="font-mono text-[10px] text-muted-foreground">{announcement.date}</span>
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground">{announcement.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border border-border/40 bg-card/30 p-6">
                  <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">QUICK ACTIONS</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 border border-border/40 hover:border-accent hover:bg-accent/5 transition-colors text-left">
                      <p className="font-mono text-xs text-foreground">Pay Rent</p>
                      <p className="font-mono text-[10px] text-muted-foreground">Make a payment</p>
                    </button>
                    <button className="p-4 border border-border/40 hover:border-accent hover:bg-accent/5 transition-colors text-left">
                      <p className="font-mono text-xs text-foreground">New Request</p>
                      <p className="font-mono text-[10px] text-muted-foreground">Submit issue</p>
                    </button>
                    <button className="p-4 border border-border/40 hover:border-accent hover:bg-accent/5 transition-colors text-left">
                      <p className="font-mono text-xs text-foreground">View Lease</p>
                      <p className="font-mono text-[10px] text-muted-foreground">Download PDF</p>
                    </button>
                    <button className="p-4 border border-border/40 hover:border-accent hover:bg-accent/5 transition-colors text-left">
                      <p className="font-mono text-xs text-foreground">Contact</p>
                      <p className="font-mono text-[10px] text-muted-foreground">Message management</p>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              {/* Payment action card */}
              <div className="border border-accent/30 bg-accent/5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">Next Payment Due</p>
                    <p className="font-[var(--font-bebas)] text-2xl text-accent">${leaseInfo.monthlyRent.toLocaleString()}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">Due {leaseInfo.nextPayment} • Auto-pay enabled</p>
                  </div>
                  <button className="px-6 py-3 bg-accent font-mono text-xs uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-colors">
                    Pay Now
                  </button>
                </div>
              </div>

              {/* Payment history */}
              <div className="border border-border/40 bg-card/30 p-6">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">PAYMENT HISTORY</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Period</th>
                        <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Amount</th>
                        <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Date</th>
                        <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Method</th>
                        <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment, index) => (
                        <tr key={index} className="border-b border-border/20">
                          <td className="py-3 font-mono text-xs text-foreground">{payment.month}</td>
                          <td className="py-3 font-mono text-xs text-foreground">${payment.amount.toLocaleString()}</td>
                          <td className="py-3 font-mono text-xs text-muted-foreground">{payment.date}</td>
                          <td className="py-3 font-mono text-xs text-muted-foreground">{payment.method}</td>
                          <td className="py-3">
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 font-mono text-[10px] uppercase">
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">SERVICE REQUESTS</h2>
                <button className="px-4 py-2 bg-accent font-mono text-[10px] uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-colors">
                  + New Request
                </button>
              </div>
              <div className="space-y-4">
                {serviceRequests.map((request) => (
                  <div key={request.id} className="border border-border/40 bg-card/30 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-muted font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {request.type}
                        </span>
                        <p className="font-mono text-sm text-foreground">{request.issue}</p>
                      </div>
                      <span className={`px-2 py-1 font-mono text-[10px] uppercase ${
                        request.status === "scheduled" ? "bg-blue-500/20 text-blue-400" : 
                        request.status === "resolved" ? "bg-green-500/20 text-green-400" : 
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="font-mono text-[10px] text-muted-foreground">Submitted: {request.submitted}</p>
                      {request.scheduledDate && (
                        <p className="font-mono text-[10px] text-accent">Scheduled: {request.scheduledDate}</p>
                      )}
                      {request.resolvedDate && (
                        <p className="font-mono text-[10px] text-green-400">Resolved: {request.resolvedDate}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="border border-border/40 bg-card/30 p-6">
              <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">MY DOCUMENTS</h2>
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between border border-border/30 p-4 hover:border-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="h-10 w-10 bg-accent/10 flex items-center justify-center font-mono text-[10px] text-accent uppercase">
                        {doc.type}
                      </span>
                      <div>
                        <p className="font-mono text-xs text-foreground">{doc.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{doc.date} • {doc.size}</p>
                      </div>
                    </div>
                    <button className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

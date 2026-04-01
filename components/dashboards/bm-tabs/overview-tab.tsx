"use client";

import React from "react";

/* ─── Demo Data ──────────────────────────────────────────────────────────────── */

const quickStats = [
  { label: "Leases Active", value: "184", detail: "96.4% occupancy" },
  { label: "Renewals Due", value: "12", detail: "next 90 days" },
  { label: "Open Work Orders", value: "23", detail: "5 urgent" },
  { label: "Packages Today", value: "47", detail: "12 pending pickup" },
  { label: "Active Visitors", value: "8", detail: "3 contractors" },
  { label: "Incidents", value: "2", detail: "this week" },
];

const leasingPipeline = [
  { unit: "Unit 1401", sqft: "1,250", status: "vacant", applications: 4, askingRent: "$3,200" },
  { unit: "Unit 807", sqft: "850", status: "notice_given", applications: 0, askingRent: "$2,400" },
  { unit: "Unit 302", sqft: "1,100", status: "in_negotiation", applications: 2, askingRent: "$2,900" },
];

const upcomingRenewals = [
  { unit: "Unit 1204", tenant: "J. Martinez", expires: "May 31", currentRent: "$2,800", proposedRent: "$2,940", status: "pending" },
  { unit: "Unit 605", tenant: "R. Chen", expires: "Jun 15", currentRent: "$2,200", proposedRent: "$2,310", status: "sent" },
  { unit: "Unit 902", tenant: "K. Williams", expires: "Jun 30", currentRent: "$3,100", proposedRent: "$3,255", status: "accepted" },
];

const shiftNotes = [
  { time: "11:00 AM", note: "FedEx delivery — 12 packages received, all scanned via ImageR", author: "Current Shift" },
  { time: "9:30 AM", note: "Contractor ABC Plumbing checked in for Unit 605 repair", author: "Current Shift" },
  { time: "8:00 AM", note: "Morning walkthrough complete — all areas clear", author: "Current Shift" },
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
};

/* ─── Overview Tab ───────────────────────────────────────────────────────────── */

export default function OverviewTab() {
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
            <span className="font-mono text-[10px] text-muted-foreground">{upcomingRenewals.length} due</span>
          </div>
          <div className="space-y-3">
            {upcomingRenewals.map((r) => (
              <div key={r.unit} className="border border-border/30 p-3">
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
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shift Log */}
      <div className="border border-border/40 bg-card/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">SHIFT LOG</h2>
          <button className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">+ Add Note</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shiftNotes.map((note, i) => (
            <div key={i} className="border-l-2 border-accent/40 pl-3 py-1">
              <p className="font-mono text-[10px] text-accent mb-1">{note.time}</p>
              <p className="font-mono text-xs text-foreground/80">{note.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

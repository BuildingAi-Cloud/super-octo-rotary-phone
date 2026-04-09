"use client";

import React, { useState, useCallback, useEffect } from "react";
import type { User } from "@/lib/auth-context";
import { AnimatedNoise } from "@/components/animated-noise";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

// ─── Types ──────────────────────────────────────────────────────────────────────

type Priority = "high" | "medium" | "low";
type RequestStatus = "new" | "in_progress" | "completed";

interface ServiceRequest {
  id: string;
  building: string;
  issue: string;
  priority: Priority;
  status: RequestStatus;
  date: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  building: string;
  contact: string;
  description: string;
}

interface ActivityEvent {
  id: number;
  text: string;
  timestamp: string;
}

interface VendorStats {
  openRequests: number;
  upcomingAppointments: number;
  pendingInvoices: number;
  completedThisMonth: number;
}

// ─── Color maps ─────────────────────────────────────────────────────────────────

const PRIORITY_STYLE: Record<Priority, string> = {
  high: "bg-red-500/10 text-red-600 border border-red-500/30",
  medium: "bg-amber-500/10 text-amber-600 border border-amber-500/30",
  low: "bg-green-500/10 text-green-600 border border-green-500/30",
};

const STATUS_STYLE: Record<RequestStatus, string> = {
  new: "bg-blue-500/10 text-blue-600 border border-blue-500/30",
  in_progress: "bg-amber-500/10 text-amber-600 border border-amber-500/30",
  completed: "bg-green-500/10 text-green-600 border border-green-500/30",
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  completed: "Completed",
};

// ─── Fallback seed data (used while API loads or on error) ──────────────────────

const FALLBACK_REQUESTS: ServiceRequest[] = [
  { id: "REQ-081", building: "Harlow Tower A", issue: "HVAC not cooling", priority: "high", status: "new", date: "2026-04-07" },
  { id: "REQ-079", building: "Meridian Block 3", issue: "Elevator maintenance", priority: "medium", status: "in_progress", date: "2026-04-05" },
  { id: "REQ-074", building: "Oakfield Centre", issue: "Plumbing leak — floor 2", priority: "high", status: "new", date: "2026-04-03" },
  { id: "REQ-068", building: "Harlow Tower B", issue: "Fire alarm inspection", priority: "low", status: "in_progress", date: "2026-03-29" },
  { id: "REQ-061", building: "Nexus Office Park", issue: "Electrical panel check", priority: "medium", status: "completed", date: "2026-03-24" },
];

const FALLBACK_APPOINTMENTS: Appointment[] = [
  { id: "apt-1", date: "2026-04-12", time: "9:00 AM", building: "Harlow Tower A", contact: "Sarah Chen", description: "HVAC Inspection" },
  { id: "apt-2", date: "2026-04-15", time: "2:30 PM", building: "Oakfield Centre", contact: "James Patel", description: "Plumbing Assessment" },
];

const INITIAL_ACTIVITY: ActivityEvent[] = [
  { id: 1, text: "Invoice #1042 submitted for Nexus Office Park", timestamp: "Today, 10:14 AM" },
  { id: 2, text: "Appointment confirmed — Apr 12, Harlow Tower A", timestamp: "Yesterday, 3:45 PM" },
  { id: 3, text: "Request #REQ-074 assigned to your team", timestamp: "Apr 6, 9:02 AM" },
  { id: 4, text: "Entry instructions updated — Meridian Block 3", timestamp: "Apr 5, 4:20 PM" },
];

// ─── API helpers ────────────────────────────────────────────────────────────────

async function fetchVendorData<T>(endpoint: string, vendorId: string): Promise<T | null> {
  try {
    const res = await fetch(`/api/vendor/${endpoint}?vendorId=${encodeURIComponent(vendorId)}`);
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

// ─── Inline Icons ───────────────────────────────────────────────────────────────

const Icons = {
  clipboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
  ),
  invoice: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
  ),
  fileUp: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3" /></svg>
  ),
  doorOpen: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M13 4v16M3 20h18M5 20V8l8-4v16" /><circle cx="10" cy="13" r="1" /></svg>
  ),
  phone: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
  ),
  arrowRight: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
  ),
  activity: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
  ),
  x: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
  ),
};

// ─── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-border/40 rounded-lg p-5 bg-background hover:border-[#D85A30]/40 transition-colors">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function VendorDashboard({ user }: { user: User }) {
  const [requests, setRequests] = useState<ServiceRequest[]>(FALLBACK_REQUESTS);
  const [appointments, setAppointments] = useState<Appointment[]>(FALLBACK_APPOINTMENTS);
  const [activity, setActivity] = useState<ActivityEvent[]>(INITIAL_ACTIVITY);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ number: "", amount: "", serviceDate: "", notes: "" });
  const [loading, setLoading] = useState(true);

  const vendorId = user.id || "vendor-1";

  // ── Fetch data from API on mount ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [reqData, aptData, statsData] = await Promise.all([
        fetchVendorData<{ requests: ServiceRequest[] }>("requests", vendorId),
        fetchVendorData<{ appointments: Appointment[] }>("appointments", vendorId),
        fetchVendorData<{ stats: VendorStats }>("stats", vendorId),
      ]);

      if (cancelled) return;

      if (reqData?.requests) setRequests(reqData.requests);
      if (aptData?.appointments) setAppointments(aptData.appointments);
      if (statsData?.stats) setStats(statsData.stats);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [vendorId]);

  // ── Derived stats (fallback when API stats not loaded) ──────────────────────
  const openCount = stats?.openRequests ?? requests.filter((r) => r.status === "new" || r.status === "in_progress").length;
  const completedCount = stats?.completedThisMonth ?? requests.filter((r) => r.status === "completed").length;
  const pendingInvoices = stats?.pendingInvoices ?? 1;
  const upcomingAppointments = stats?.upcomingAppointments ?? appointments.length;

  // ── Accept handler — calls API then updates local state ─────────────────────
  const handleAccept = useCallback(async (id: string) => {
    // Optimistic update
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "in_progress" as RequestStatus } : r))
    );
    setActivity((prev) => [
      { id: Date.now(), text: `Request ${id} accepted — status changed to In Progress`, timestamp: "Just now" },
      ...prev,
    ]);

    // Persist via API
    try {
      await fetch("/api/vendor/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, status: "in_progress" }),
      });
    } catch {
      // Optimistic update already applied; API will sync on next load
    }
  }, []);

  // ── Invoice submit — calls API then updates local state ─────────────────────
  const handleInvoiceSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!invoiceForm.number || !invoiceForm.amount) return;

      const amount = parseFloat(invoiceForm.amount);
      if (!Number.isFinite(amount) || amount <= 0) return;

      setActivity((prev) => [
        { id: Date.now(), text: `Invoice #${invoiceForm.number} submitted — $${invoiceForm.amount}`, timestamp: "Just now" },
        ...prev,
      ]);
      setInvoiceForm({ number: "", amount: "", serviceDate: "", notes: "" });
      setInvoiceOpen(false);

      // Persist via API
      try {
        await fetch("/api/vendor/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendorId,
            invoiceNumber: invoiceForm.number,
            amount,
            serviceDate: invoiceForm.serviceDate || null,
            notes: invoiceForm.notes,
            requestId: null,
          }),
        });
      } catch {
        // Already reflected in UI optimistically
      }
    },
    [invoiceForm, vendorId]
  );

  // ── Action button for request row ───────────────────────────────────────────
  const actionButton = (req: ServiceRequest) => {
    switch (req.status) {
      case "new":
        return (
          <button
            onClick={() => handleAccept(req.id)}
            className="px-3 py-1 text-xs font-medium border border-[#D85A30] text-[#D85A30] rounded hover:bg-[#D85A30] hover:text-white transition-colors"
          >
            Accept
          </button>
        );
      case "in_progress":
        return (
          <button className="px-3 py-1 text-xs font-medium border border-amber-500 text-amber-600 rounded hover:bg-amber-500 hover:text-white transition-colors">
            Update
          </button>
        );
      case "completed":
        return (
          <button className="px-3 py-1 text-xs font-medium border border-green-500 text-green-600 rounded hover:bg-green-500 hover:text-white transition-colors">
            Invoice
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <main className="relative min-h-screen bg-background">
      <AnimatedNoise opacity={0.03} />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 py-8">
        {/* ── Page heading ──────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome, {user.name?.split(" ")[0] || "Vendor"}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s an overview of your service activity and upcoming appointments.
          </p>
        </div>

        {/* ── 1. Stats Row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Open Requests" value={loading ? "—" : openCount} sub="Active service requests" />
          <StatCard label="Upcoming Appointments" value={loading ? "—" : upcomingAppointments} sub={appointments[0] ? `Next: ${new Date(appointments[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : undefined} />
          <StatCard label="Pending Invoices" value={loading ? "—" : pendingInvoices} sub="Awaiting approval" />
          <StatCard label="Completed This Month" value={loading ? "—" : completedCount} sub="Closed requests" />
        </div>

        {/* ── 2. Quick Actions ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setInvoiceOpen(true)}
            className="flex items-center gap-3 border border-border/40 rounded-lg p-4 bg-background hover:border-[#D85A30]/60 transition-colors text-left group"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#D85A30]/10 text-[#D85A30] group-hover:bg-[#D85A30] group-hover:text-white transition-colors">
              {Icons.fileUp}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Submit Invoice</p>
              <p className="text-xs text-muted-foreground">Upload billing for completed work</p>
            </div>
          </button>

          <button className="flex items-center gap-3 border border-border/40 rounded-lg p-4 bg-background hover:border-[#D85A30]/60 transition-colors text-left group">
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#D85A30]/10 text-[#D85A30] group-hover:bg-[#D85A30] group-hover:text-white transition-colors">
              {Icons.doorOpen}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Entry Instructions</p>
              <p className="text-xs text-muted-foreground">Access building entry guides</p>
            </div>
          </button>

          <button className="flex items-center gap-3 border border-border/40 rounded-lg p-4 bg-background hover:border-[#D85A30]/60 transition-colors text-left group">
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#D85A30]/10 text-[#D85A30] group-hover:bg-[#D85A30] group-hover:text-white transition-colors">
              {Icons.phone}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Contact Manager</p>
              <p className="text-xs text-muted-foreground">Message building staff directly</p>
            </div>
          </button>
        </div>

        {/* ── 3 & 5. Service Requests Table + Recent Activity sidebar ─────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Service Requests Table */}
          <div className="lg:col-span-2 border border-border/40 rounded-lg bg-background overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
              <h2 className="text-base font-semibold text-foreground">Service Requests</h2>
              <a href="#" className="text-xs font-medium text-[#D85A30] hover:underline flex items-center gap-1">
                View all {Icons.arrowRight}
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border/20">
                    <th className="px-5 py-3 font-medium">ID</th>
                    <th className="px-3 py-3 font-medium">Building</th>
                    <th className="px-3 py-3 font-medium">Issue</th>
                    <th className="px-3 py-3 font-medium">Priority</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-b border-border/10 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{req.id}</td>
                      <td className="px-3 py-3 text-foreground">{req.building}</td>
                      <td className="px-3 py-3 text-foreground">{req.issue}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${PRIORITY_STYLE[req.priority]}`}>
                          {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_STYLE[req.status]}`}>
                          {STATUS_LABEL[req.status]}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{req.date}</td>
                      <td className="px-3 py-3 text-right">{actionButton(req)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="border border-border/40 rounded-lg bg-background">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
              <h2 className="text-base font-semibold text-foreground">Upcoming Appointments</h2>
              <a href="#" className="text-xs font-medium text-[#D85A30] hover:underline flex items-center gap-1">
                View all {Icons.arrowRight}
              </a>
            </div>
            <div className="divide-y divide-border/20">
              {appointments.map((apt) => (
                <div key={apt.id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
                  <p className="text-xs font-semibold text-[#D85A30] tracking-wide mb-1">
                    {new Date(apt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()} — {apt.time}
                  </p>
                  <p className="text-sm font-semibold text-foreground">{apt.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {apt.building} · {apt.contact}
                  </p>
                  <a href="#" className="inline-flex items-center gap-1 text-xs text-[#D85A30] hover:underline mt-2">
                    View details {Icons.arrowRight}
                  </a>
                </div>
              ))}
            </div>

            {/* Recent Activity (below appointments on right rail) */}
            <div className="border-t border-border/30">
              <div className="px-5 py-4 border-b border-border/20">
                <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
              </div>
              <div className="divide-y divide-border/10">
                {activity.slice(0, 4).map((ev) => (
                  <div key={ev.id} className="px-5 py-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-[#D85A30]">{Icons.activity}</span>
                      <div>
                        <p className="text-xs text-foreground leading-relaxed">{ev.text}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{ev.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Invoice Modal ────────────────────────────────────────────────────── */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-lg font-bold text-foreground">Submit Invoice</DialogTitle>
          <form onSubmit={handleInvoiceSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Invoice Number</label>
              <input
                type="text"
                placeholder="e.g. INV-1043"
                value={invoiceForm.number}
                onChange={(e) => setInvoiceForm((f) => ({ ...f, number: e.target.value }))}
                className="w-full h-9 px-3 border border-border rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40 focus:border-[#D85A30]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full h-9 px-3 border border-border rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40 focus:border-[#D85A30]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Service Date</label>
              <input
                type="date"
                value={invoiceForm.serviceDate}
                onChange={(e) => setInvoiceForm((f) => ({ ...f, serviceDate: e.target.value }))}
                className="w-full h-9 px-3 border border-border rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40 focus:border-[#D85A30]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
              <textarea
                rows={3}
                placeholder="Additional details..."
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D85A30]/40 focus:border-[#D85A30] resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <DialogClose asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium border border-border rounded-md text-muted-foreground hover:bg-muted/40 transition-colors"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium rounded-md bg-[#D85A30] text-white hover:bg-[#C04E28] transition-colors"
              >
                Submit Invoice
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

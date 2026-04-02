"use client";

import React, { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/back-button";

interface ActiveLease {
  id: string;
  unit: string;
  floor: number;
  sqft: number;
  tenant: string;
  email: string;
  phone: string;
  monthlyRent: number;
  startDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  leaseType: "12-month" | "18-month" | "24-month" | "36-month";
  status: "active" | "expiring_soon" | "renewal_pending";
}

const ACTIVE_LEASES: ActiveLease[] = [
  {
    id: "L-001",
    unit: "Unit 101",
    floor: 1,
    sqft: 950,
    tenant: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    monthlyRent: 2400,
    startDate: "2023-03-15",
    expiryDate: "2026-03-14",
    daysUntilExpiry: 347,
    leaseType: "36-month",
    status: "active",
  },
  {
    id: "L-002",
    unit: "Unit 205",
    floor: 2,
    sqft: 1200,
    tenant: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 234-5678",
    monthlyRent: 3100,
    startDate: "2022-06-01",
    expiryDate: "2025-05-31",
    daysUntilExpiry: 60,
    leaseType: "36-month",
    status: "expiring_soon",
  },
  {
    id: "L-003",
    unit: "Unit 302",
    floor: 3,
    sqft: 1100,
    tenant: "Michael Chen",
    email: "m.chen@email.com",
    phone: "(555) 345-6789",
    monthlyRent: 2900,
    startDate: "2024-01-10",
    expiryDate: "2026-01-09",
    daysUntilExpiry: 283,
    leaseType: "24-month",
    status: "active",
  },
  {
    id: "L-004",
    unit: "Unit 410",
    floor: 4,
    sqft: 1350,
    tenant: "Emma Wilson",
    email: "emma.w@email.com",
    phone: "(555) 456-7890",
    monthlyRent: 3500,
    startDate: "2023-09-01",
    expiryDate: "2025-08-31",
    daysUntilExpiry: 31,
    leaseType: "24-month",
    status: "expiring_soon",
  },
  {
    id: "L-005",
    unit: "Unit 504",
    floor: 5,
    sqft: 1450,
    tenant: "David Martinez",
    email: "d.martinez@email.com",
    phone: "(555) 567-8901",
    monthlyRent: 3800,
    startDate: "2023-04-15",
    expiryDate: "2026-04-14",
    daysUntilExpiry: 378,
    leaseType: "36-month",
    status: "active",
  },
  {
    id: "L-006",
    unit: "Unit 607",
    floor: 6,
    sqft: 1250,
    tenant: "Lisa Anderson",
    email: "lisa.a@email.com",
    phone: "(555) 678-9012",
    monthlyRent: 3200,
    startDate: "2023-11-01",
    expiryDate: "2025-10-31",
    daysUntilExpiry: 304,
    leaseType: "24-month",
    status: "active",
  },
  {
    id: "L-007",
    unit: "Unit 705",
    floor: 7,
    sqft: 2000,
    tenant: "Robert Brown",
    email: "r.brown@email.com",
    phone: "(555) 789-0123",
    monthlyRent: 4200,
    startDate: "2024-02-15",
    expiryDate: "2026-02-14",
    daysUntilExpiry: 319,
    leaseType: "24-month",
    status: "active",
  },
  {
    id: "L-008",
    unit: "Unit 808",
    floor: 8,
    sqft: 1150,
    tenant: "Jessica Taylor",
    email: "j.taylor@email.com",
    phone: "(555) 890-1234",
    monthlyRent: 2800,
    startDate: "2025-01-10",
    expiryDate: "2025-03-15",
    daysUntilExpiry: 15,
    leaseType: "12-month",
    status: "renewal_pending",
  },
];

type FilterStatus = "all" | "active" | "expiring_soon" | "renewal_pending";
type SortBy = "unit" | "tenant" | "rent" | "expiry";

export default function ActiveLeasesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("expiry");
  const [selectedLease, setSelectedLease] = useState<ActiveLease | null>(null);

  const filteredAndSortedLeases = useMemo(() => {
    let filtered = ACTIVE_LEASES.filter((lease) => {
      if (filterStatus !== "all" && lease.status !== filterStatus) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        lease.unit.toLowerCase().includes(searchLower) ||
        lease.tenant.toLowerCase().includes(searchLower) ||
        lease.email.toLowerCase().includes(searchLower)
      );
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "unit":
          return a.unit.localeCompare(b.unit);
        case "tenant":
          return a.tenant.localeCompare(b.tenant);
        case "rent":
          return b.monthlyRent - a.monthlyRent;
        case "expiry":
          return a.daysUntilExpiry - b.daysUntilExpiry;
        default:
          return 0;
      }
    });

    return filtered;
  }, [filterStatus, searchTerm, sortBy]);

  const stats = {
    total: ACTIVE_LEASES.length,
    active: ACTIVE_LEASES.filter((l) => l.status === "active").length,
    expiringSoon: ACTIVE_LEASES.filter((l) => l.status === "expiring_soon").length,
    renewalPending: ACTIVE_LEASES.filter((l) => l.status === "renewal_pending").length,
    monthlyRevenue: ACTIVE_LEASES.reduce((sum, l) => sum + l.monthlyRent, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "border-green-500/40 text-green-500";
      case "expiring_soon":
        return "border-orange-500/40 text-orange-500";
      case "renewal_pending":
        return "border-yellow-500/40 text-yellow-500";
      default:
        return "border-gray-500/40 text-gray-500";
    }
  };

  const getUrgencyColor = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 30) return "text-red-500";
    if (daysUntilExpiry <= 90) return "text-orange-500";
    return "text-green-500";
  };

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-sm text-muted-foreground">Loading leases...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground">Please sign in to view active leases.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 pt-24">
      <div className="mb-8">
        <BackButton fallbackHref="/dashboard" />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Active Leases</h1>
        <p className="font-mono text-xs text-muted-foreground mt-3">
          Manage {stats.total} active leases • {stats.monthlyRevenue.toLocaleString()} monthly revenue
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-border/40 bg-card/30 rounded-lg p-4 md:p-5">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Total Active</p>
          <p className="text-2xl md:text-3xl font-bold text-green-500 mt-2">{stats.active}</p>
          <p className="text-xs font-mono text-muted-foreground mt-2">{((stats.active / stats.total) * 100).toFixed(1)}% occupancy</p>
        </div>
        <div className="border border-border/40 bg-card/30 rounded-lg p-4 md:p-5">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Expiring Soon</p>
          <p className="text-2xl md:text-3xl font-bold text-orange-500 mt-2">{stats.expiringSoon}</p>
          <p className="text-xs font-mono text-muted-foreground mt-2">Next 90 days</p>
        </div>
        <div className="border border-border/40 bg-card/30 rounded-lg p-4 md:p-5">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Need Renewal</p>
          <p className="text-2xl md:text-3xl font-bold text-yellow-500 mt-2">{stats.renewalPending}</p>
          <p className="text-xs font-mono text-muted-foreground mt-2">Action needed</p>
        </div>
        <div className="border border-border/40 bg-card/30 rounded-lg p-4 md:p-5">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Monthly Revenue</p>
          <p className="text-2xl md:text-3xl font-bold text-accent mt-2">${(stats.monthlyRevenue / 1000).toFixed(1)}k</p>
          <p className="text-xs font-mono text-muted-foreground mt-2">Current leases</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by unit, tenant, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 text-xs font-mono bg-background border border-border/40 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-3 py-2 text-xs font-mono bg-background border border-border/40 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="renewal_pending">Renewal Pending</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 text-xs font-mono bg-background border border-border/40 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="expiry">Sort: Expiry Date</option>
            <option value="unit">Sort: Unit</option>
            <option value="tenant">Sort: Tenant</option>
            <option value="rent">Sort: Rent (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filteredAndSortedLeases.length === 0 ? (
          <div className="border border-border/40 rounded-lg p-12 text-center">
            <p className="font-mono text-sm text-muted-foreground">No leases match your search criteria</p>
          </div>
        ) : (
          filteredAndSortedLeases.map((lease) => (
            <button
              key={lease.id}
              onClick={() => setSelectedLease(selectedLease?.id === lease.id ? null : lease)}
              className="w-full text-left border border-border/40 bg-card/30 rounded-lg p-5 md:p-6 hover:bg-card/50 transition-colors"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium">{lease.unit}</span>
                    <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider border rounded ${getStatusColor(lease.status)}`}>
                      {lease.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground mt-1.5">{lease.tenant}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium text-accent">${lease.monthlyRent.toLocaleString()}</p>
                  <p className="font-mono text-xs text-muted-foreground">Monthly rent</p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-border/20">
                <div className="text-[10px] font-mono">
                  <span className="text-muted-foreground uppercase tracking-wider">Floor / Sqft</span>
                  <p className="text-foreground mt-1">{lease.floor} / {lease.sqft.toLocaleString()} sqft</p>
                </div>
                <div className="text-[10px] font-mono">
                  <span className="text-muted-foreground uppercase tracking-wider">Lease Type</span>
                  <p className="text-foreground mt-1">{lease.leaseType}</p>
                </div>
                <div className="text-[10px] font-mono">
                  <span className="text-muted-foreground uppercase tracking-wider">Start Date</span>
                  <p className="text-foreground mt-1">{lease.startDate}</p>
                </div>
                <div className="text-[10px] font-mono">
                  <span className="text-muted-foreground uppercase tracking-wider">Expiry Date</span>
                  <p className={`mt-1 font-medium ${getUrgencyColor(lease.daysUntilExpiry)}`}>{lease.expiryDate}</p>
                </div>
              </div>

              {/* Expiry urgency */}
              <div className="mt-4 pt-4 border-t border-border/20">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-medium ${getUrgencyColor(lease.daysUntilExpiry)}`}>
                    {lease.daysUntilExpiry} days until expiry
                  </span>
                  {lease.daysUntilExpiry <= 90 && (
                    <span className="text-[10px] font-mono px-2 py-1 bg-orange-500/20 text-orange-500 rounded">⚠️ Action Needed</span>
                  )}
                </div>
              </div>

              {/* Expandable details */}
              {selectedLease?.id === lease.id && (
                <div className="mt-4 pt-4 border-t border-border/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="text-[10px] font-mono">
                      <span className="text-muted-foreground uppercase tracking-wider">Tenant Email</span>
                      <p className="text-foreground mt-1 break-all">{lease.email}</p>
                    </div>
                    <div className="text-[10px] font-mono">
                      <span className="text-muted-foreground uppercase tracking-wider">Tenant Phone</span>
                      <p className="text-foreground mt-1">{lease.phone}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Action for renewal
                      }}
                      className="px-3 py-2 text-xs font-mono uppercase tracking-widest border border-accent/50 text-accent rounded hover:bg-accent/10 transition-colors"
                    >
                      Renew Lease
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Action for edit
                      }}
                      className="px-3 py-2 text-xs font-mono uppercase tracking-widest border border-accent/50 text-accent rounded hover:bg-accent/10 transition-colors"
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </main>
  );
}

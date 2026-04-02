"use client";

import React, { useState } from "react";
import { listLeasingUnits, updateLeasingUnit, type LeaseApplication, type LeasingUnitRecord, type LeaseStatus, type ApplicationStatus } from "@/lib/lease-management-store";
import type { BuildingType, PaymentCollectionMode, PaymentMethod, PaymentSchedule } from "@/lib/tenant-portal-config";
import { Icons, Badge, FilterBar, FilterChip, SearchInput, SectionCard, EmptyState, SimpleBarChart, StatusDot } from "./bm-shared";

interface Renewal {
  id: string;
  unit: string;
  currentTenant: string;
  currentRent: number;
  expiryDate: string;
  proposedRent: number;
  status: "active" | "pending_renewal" | "renewed" | "not_renewed";
  daysUntilExpiry: number;
}

const RENEWALS: Renewal[] = [
  {
    id: "r1",
    unit: "Unit 1204",
    currentTenant: "Sarah Zhang",
    currentRent: 3100,
    expiryDate: "2025-03-15",
    proposedRent: 3250,
    status: "pending_renewal",
    daysUntilExpiry: 51,
  },
  {
    id: "r2",
    unit: "Unit 605",
    currentTenant: "Marcus Johnson",
    currentRent: 2700,
    expiryDate: "2025-04-20",
    proposedRent: 2850,
    status: "active",
    daysUntilExpiry: 87,
  },
  {
    id: "r3",
    unit: "Unit 902",
    currentTenant: "Olivia Williams",
    currentRent: 3500,
    expiryDate: "2025-02-28",
    proposedRent: 3650,
    status: "pending_renewal",
    daysUntilExpiry: 35,
  },
];

export default function LeasingPipelineTab() {
  const [units, setUnits] = useState<LeasingUnitRecord[]>(() => listLeasingUnits());
  const [view, setView] = useState<"pipeline" | "applications" | "renewals">("pipeline");
  const [filter, setFilter] = useState<LeaseStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<LeasingUnitRecord | null>(null);

  // Pipeline filtering
  const filteredUnits = units.filter((u) => {
    if (filter !== "all" && u.status !== filter) return false;
    return u.unit.toLowerCase().includes(search.toLowerCase());
  });

  // Get lease status color
  const getStatusColor = (status: LeaseStatus) => {
    const colors = {
      vacant: "border-red-500/40 text-red-500",
      notice_given: "border-yellow-500/40 text-yellow-500",
      in_negotiation: "border-orange-500/40 text-orange-500",
      leased: "border-green-500/40 text-green-500",
    };
    return colors[status];
  };

  const getApplicationStatusColor = (status: ApplicationStatus) => {
    const colors = {
      pending: "border-yellow-500/40 text-yellow-500",
      approved: "border-green-500/40 text-green-500",
      rejected: "border-red-500/40 text-red-500",
    };
    return colors[status];
  };

  // Calculate metrics
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === "leased").length;
  const occupancyRate = ((occupiedUnits / totalUnits) * 100).toFixed(0);
  const monthlyRevenue = units.filter((u) => u.status === "leased").reduce((sum, u) => sum + (u.currentRent || 0), 0);
  const pendingApplications = units.reduce((sum, u) => sum + (u.applicationDetails?.filter((a) => a.status === "pending").length || 0), 0);
  const upcomingRenewals = RENEWALS.filter((r) => r.status === "pending_renewal").length;

  const selectedUnitDetails = selectedUnit ? units.find((unit) => unit.id === selectedUnit.id) || null : null;

  const updateSelectedUnit = (unitId: string, updates: Partial<LeasingUnitRecord>) => {
    const nextUnits = updateLeasingUnit(unitId, updates);
    setUnits(nextUnits);
    const nextSelected = nextUnits.find((unit) => unit.id === unitId) || null;
    setSelectedUnit(nextSelected);
  };

  const toggleSelectedUnitPaymentMethod = (unitId: string, method: PaymentMethod, checked: boolean) => {
    const currentUnit = units.find((unit) => unit.id === unitId);
    if (!currentUnit) return;

    const currentMethods = currentUnit.paymentMethods || [];
    const nextMethods = checked
      ? [...new Set([...currentMethods, method])]
      : currentMethods.filter((item) => item !== method);

    updateSelectedUnit(unitId, {
      paymentMethods: nextMethods,
      primaryPaymentMethod: nextMethods.includes(currentUnit.primaryPaymentMethod || method)
        ? currentUnit.primaryPaymentMethod || method
        : nextMethods[0],
    });
  };

  // Revenue trend data
  const revenueData = [
    { label: "Jan", value: monthlyRevenue * 0.95 },
    { label: "Feb", value: monthlyRevenue * 0.92 },
    { label: "Mar", value: monthlyRevenue * 0.88 },
    { label: "Apr", value: monthlyRevenue * 0.85 },
    { label: "May", value: monthlyRevenue },
  ];

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-border/40 bg-card/30 rounded-lg p-3 md:p-4">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Occupancy</p>
          <p className="text-lg md:text-2xl font-bold text-accent mt-1">{occupancyRate}%</p>
          <p className="text-xs font-mono text-muted-foreground mt-1">{occupiedUnits} of {totalUnits} units</p>
        </div>
        <div className="border border-border/40 bg-card/30 rounded-lg p-3 md:p-4">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Monthly Revenue</p>
          <p className="text-lg md:text-2xl font-bold text-green-500 mt-1">${(monthlyRevenue / 1000).toFixed(1)}k</p>
          <p className="text-xs font-mono text-muted-foreground mt-1">Leased units</p>
        </div>
        <div className="border border-border/40 bg-card/30 rounded-lg p-3 md:p-4">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Pending Apps</p>
          <p className="text-lg md:text-2xl font-bold text-yellow-500 mt-1">{pendingApplications}</p>
          <p className="text-xs font-mono text-muted-foreground mt-1">Need review</p>
        </div>
        <div className="border border-border/40 bg-card/30 rounded-lg p-3 md:p-4">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Renewals Due</p>
          <p className="text-lg md:text-2xl font-bold text-orange-500 mt-1">{upcomingRenewals}</p>
          <p className="text-xs font-mono text-muted-foreground mt-1">Next 90 days</p>
        </div>
      </div>

      {/* Revenue trend */}
      <SectionCard title="Projected Monthly Revenue">
        <div className="h-24">
          <SimpleBarChart data={revenueData} />
        </div>
      </SectionCard>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setView("pipeline")}
          className={`px-4 py-1.5 text-xs font-mono rounded-md border transition-colors ${
            view === "pipeline" ? "border-accent bg-accent/10 text-accent" : "border-border/40 text-muted-foreground hover:text-accent"
          }`}
        >
          Pipeline
        </button>
        <button
          type="button"
          onClick={() => setView("applications")}
          className={`px-4 py-1.5 text-xs font-mono rounded-md border transition-colors ${
            view === "applications" ? "border-accent bg-accent/10 text-accent" : "border-border/40 text-muted-foreground hover:text-accent"
          }`}
        >
          Applications
        </button>
        <button
          type="button"
          onClick={() => setView("renewals")}
          className={`px-4 py-1.5 text-xs font-mono rounded-md border transition-colors ${
            view === "renewals" ? "border-accent bg-accent/10 text-accent" : "border-border/40 text-muted-foreground hover:text-accent"
          }`}
        >
          Renewals
        </button>
      </div>

      {/* Pipeline View */}
      {view === "pipeline" && (
        <>
          <FilterBar>
            {(["all", "vacant", "notice_given", "in_negotiation", "leased"] as const).map((f) => (
              <FilterChip
                key={f}
                label={
                  f === "all"
                    ? "All"
                    : f === "notice_given"
                      ? "Notice Given"
                      : f === "in_negotiation"
                        ? "Negotiating"
                        : f.charAt(0).toUpperCase() + f.slice(1)
                }
                active={filter === f}
                onClick={() => setFilter(f)}
              />
            ))}
            <SearchInput value={search} onChange={setSearch} placeholder="Search units..." />
          </FilterBar>

          <SectionCard
            title="Lease Pipeline"
            actions={
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-accent hover:text-accent/80 transition-colors"
              >
                {Icons.plus}
                New Unit
              </button>
            }
          >
            {filteredUnits.length === 0 ? (
              <EmptyState message="No units match your filters" />
            ) : (
              <div className="space-y-2">
                {filteredUnits.map((unit) => (
                  <div
                    key={unit.id}
                    onClick={() => setSelectedUnit(selectedUnit?.id === unit.id ? null : unit)}
                    className="cursor-pointer border border-border/20 rounded-md p-4 hover:bg-card/50 transition-colors"
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium">{unit.unit}</span>
                          <Badge className={getStatusColor(unit.status)}>
                            {unit.status === "notice_given" ? "Notice Given" : unit.status === "in_negotiation" ? "Negotiating" : unit.status}
                          </Badge>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground">{unit.sqft.toLocaleString()} sqft • Floor {unit.floor}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-medium text-accent">${unit.askingRent.toLocaleString()}</p>
                        <p className="text-xs font-mono text-muted-foreground">Asking rent</p>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 pb-3 border-b border-border/20">
                      {unit.status === "vacant" && unit.listed && (
                        <div className="text-[10px] font-mono text-muted-foreground">
                          <span className="uppercase">Listed</span>
                          <p className="text-foreground mt-0.5">{unit.listed}</p>
                        </div>
                      )}
                      {unit.status === "notice_given" && unit.moveOut && (
                        <div className="text-[10px] font-mono text-muted-foreground">
                          <span className="uppercase">Move Out</span>
                          <p className="text-foreground mt-0.5">{unit.moveOut}</p>
                        </div>
                      )}
                      {unit.currentTenant && (
                        <div className="text-[10px] font-mono text-muted-foreground">
                          <span className="uppercase">Current Tenant</span>
                          <p className="text-foreground mt-0.5">{unit.currentTenant}</p>
                        </div>
                      )}
                      {unit.currentRent && (
                        <div className="text-[10px] font-mono text-muted-foreground">
                          <span className="uppercase">Current Rent</span>
                          <p className="text-foreground mt-0.5">${unit.currentRent.toLocaleString()}</p>
                        </div>
                      )}
                      <div className="text-[10px] font-mono text-muted-foreground">
                        <span className="uppercase">Applications</span>
                        <p className="text-accent font-medium mt-0.5">{unit.applications}</p>
                      </div>
                    </div>

                    {/* Expandable applications section */}
                    {selectedUnit?.id === unit.id && (
                      <div className="mt-3 pt-3 border-t border-border/20 space-y-4">
                        {unit.applicationDetails && unit.applicationDetails.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-mono font-medium text-muted-foreground uppercase">Applications ({unit.applications})</p>
                            {unit.applicationDetails.map((app: LeaseApplication) => (
                              <div key={app.id} className="flex items-center gap-3 text-xs font-mono bg-background/50 p-2 rounded">
                                <StatusDot status={app.status === "approved" ? "green" : app.status === "pending" ? "yellow" : "red"} />
                                <div className="flex-1">
                                  <p className="font-medium">{app.tenant}</p>
                                  <p className="text-muted-foreground text-[10px]">Applied {app.appliedDate} • Move-in {app.moveInDate}</p>
                                </div>
                                <Badge className={getApplicationStatusColor(app.status)}>{app.status}</Badge>
                                <p className="text-accent font-medium">${app.proposedRent.toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {selectedUnitDetails?.id === unit.id && (
                          <div className="border border-accent/20 bg-accent/5 rounded-md p-4">
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <div>
                                <p className="text-xs font-mono font-medium uppercase text-accent">Portal Payment Routing</p>
                                <p className="text-[10px] font-mono text-muted-foreground">Control whether this unit pays in the portal or directly to the owner.</p>
                              </div>
                              <Badge className={selectedUnitDetails.paymentCollectionMode === "owner_direct" ? "border-yellow-500/40 text-yellow-500" : "border-green-500/40 text-green-500"}>
                                {selectedUnitDetails.paymentCollectionMode === "owner_direct" ? "Owner Direct" : selectedUnitDetails.paymentCollectionMode === "flexible" ? "Flexible" : "Portal Billing"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                Building Type
                                <select
                                  value={selectedUnitDetails.buildingType}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={(event) => updateSelectedUnit(unit.id, { buildingType: event.target.value as BuildingType })}
                                  className="mt-1 w-full border border-border/40 bg-background px-2 py-2 text-xs text-foreground"
                                >
                                  <option value="rental_tower">Rental Tower</option>
                                  <option value="condo">Condo</option>
                                  <option value="mixed_use">Mixed Use</option>
                                  <option value="commercial">Commercial</option>
                                  <option value="student_housing">Student Housing</option>
                                </select>
                              </label>

                              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                Collection Mode
                                <select
                                  value={selectedUnitDetails.paymentCollectionMode || "portal"}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={(event) => updateSelectedUnit(unit.id, { paymentCollectionMode: event.target.value as PaymentCollectionMode })}
                                  className="mt-1 w-full border border-border/40 bg-background px-2 py-2 text-xs text-foreground"
                                >
                                  <option value="portal">Portal Payment</option>
                                  <option value="owner_direct">Owner Direct</option>
                                  <option value="flexible">Flexible / Hybrid</option>
                                </select>
                              </label>

                              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider md:col-span-2">
                                Available Payment Methods
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                                  {(["credit_card", "e_transfer", "offline"] as PaymentMethod[]).map((method) => (
                                    <label key={method} className="flex items-center gap-2 border border-border/30 bg-background px-3 py-2 text-[10px] text-foreground">
                                      <input
                                        type="checkbox"
                                        checked={(selectedUnitDetails.paymentMethods || []).includes(method)}
                                        onClick={(event) => event.stopPropagation()}
                                        onChange={(event) => toggleSelectedUnitPaymentMethod(unit.id, method, event.target.checked)}
                                      />
                                      <span>{method === "credit_card" ? "Credit Card" : method === "e_transfer" ? "E-Transfer" : "Offline"}</span>
                                    </label>
                                  ))}
                                </div>
                              </label>

                              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                Primary Method
                                <select
                                  value={selectedUnitDetails.primaryPaymentMethod || "credit_card"}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={(event) => updateSelectedUnit(unit.id, { primaryPaymentMethod: event.target.value as PaymentMethod })}
                                  className="mt-1 w-full border border-border/40 bg-background px-2 py-2 text-xs text-foreground"
                                >
                                  <option value="credit_card">Credit Card</option>
                                  <option value="e_transfer">E-Transfer</option>
                                  <option value="offline">Offline</option>
                                </select>
                              </label>

                              <label className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-5">
                                <input
                                  type="checkbox"
                                  checked={Boolean(selectedUnitDetails.allowPaymentSetup)}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={(event) => updateSelectedUnit(unit.id, { allowPaymentSetup: event.target.checked })}
                                />
                                Allow tenant payment setup
                              </label>

                              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider md:col-span-2">
                                Portal User Email
                                <input
                                  value={selectedUnitDetails.tenantEmail || ""}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={(event) => updateSelectedUnit(unit.id, { tenantEmail: event.target.value })}
                                  placeholder="tenant@example.com"
                                  className="mt-1 w-full border border-border/40 bg-background px-2 py-2 text-xs text-foreground"
                                />
                              </label>

                              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                Payment Contact
                                <input
                                  value={selectedUnitDetails.paymentContact || ""}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={(event) => updateSelectedUnit(unit.id, { paymentContact: event.target.value })}
                                  placeholder="Accounts team or owner rep"
                                  className="mt-1 w-full border border-border/40 bg-background px-2 py-2 text-xs text-foreground"
                                />
                              </label>

                              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                Next Payment Date
                                <input
                                  value={selectedUnitDetails.nextPayment || ""}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={(event) => updateSelectedUnit(unit.id, { nextPayment: event.target.value })}
                                  placeholder="Apr 1, 2026"
                                  className="mt-1 w-full border border-border/40 bg-background px-2 py-2 text-xs text-foreground"
                                />
                              </label>

                              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider md:col-span-2">
                                Payment Instructions
                                <textarea
                                  value={selectedUnitDetails.paymentInstructions || ""}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={(event) => updateSelectedUnit(unit.id, { paymentInstructions: event.target.value })}
                                  rows={3}
                                  placeholder="Explain whether the tenant pays in-app or directly to the owner."
                                  className="mt-1 w-full border border-border/40 bg-background px-2 py-2 text-xs text-foreground"
                                />
                              </label>

                              {selectedUnitDetails.buildingType === "commercial" && (
                                <>
                                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                    Invoice Terms
                                    <input
                                      value={selectedUnitDetails.commercialBilling?.invoiceTerms || ""}
                                      onClick={(event) => event.stopPropagation()}
                                      onChange={(event) => updateSelectedUnit(unit.id, {
                                        commercialBilling: {
                                          invoiceTerms: event.target.value,
                                          purchaseOrderReference: selectedUnitDetails.commercialBilling?.purchaseOrderReference,
                                          billingReference: selectedUnitDetails.commercialBilling?.billingReference,
                                          paymentSchedule: selectedUnitDetails.commercialBilling?.paymentSchedule || "monthly",
                                          paymentScheduleNotes: selectedUnitDetails.commercialBilling?.paymentScheduleNotes,
                                        },
                                      })}
                                      placeholder="Net 15"
                                      className="mt-1 w-full border border-border/40 bg-background px-2 py-2 text-xs text-foreground"
                                    />
                                  </label>

                                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                    Payment Schedule
                                    <select
                                      value={selectedUnitDetails.commercialBilling?.paymentSchedule || "monthly"}
                                      onClick={(event) => event.stopPropagation()}
                                      onChange={(event) => updateSelectedUnit(unit.id, {
                                        commercialBilling: {
                                          invoiceTerms: selectedUnitDetails.commercialBilling?.invoiceTerms || "",
                                          purchaseOrderReference: selectedUnitDetails.commercialBilling?.purchaseOrderReference,
                                          billingReference: selectedUnitDetails.commercialBilling?.billingReference,
                                          paymentSchedule: event.target.value as PaymentSchedule,
                                          paymentScheduleNotes: selectedUnitDetails.commercialBilling?.paymentScheduleNotes,
                                        },
                                      })}
                                      className="mt-1 w-full border border-border/40 bg-background px-2 py-2 text-xs text-foreground"
                                    >
                                      <option value="monthly">Monthly</option>
                                      <option value="biweekly">Bi-Weekly</option>
                                      <option value="on_invoice">On Invoice</option>
                                      <option value="custom">Custom</option>
                                    </select>
                                  </label>

                                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                    PO Reference
                                    <input
                                      value={selectedUnitDetails.commercialBilling?.purchaseOrderReference || ""}
                                      onClick={(event) => event.stopPropagation()}
                                      onChange={(event) => updateSelectedUnit(unit.id, {
                                        commercialBilling: {
                                          invoiceTerms: selectedUnitDetails.commercialBilling?.invoiceTerms || "",
                                          purchaseOrderReference: event.target.value,
                                          billingReference: selectedUnitDetails.commercialBilling?.billingReference,
                                          paymentSchedule: selectedUnitDetails.commercialBilling?.paymentSchedule || "monthly",
                                          paymentScheduleNotes: selectedUnitDetails.commercialBilling?.paymentScheduleNotes,
                                        },
                                      })}
                                      placeholder="PO-12345"
                                      className="mt-1 w-full border border-border/40 bg-background px-2 py-2 text-xs text-foreground"
                                    />
                                  </label>

                                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                    Billing Reference
                                    <input
                                      value={selectedUnitDetails.commercialBilling?.billingReference || ""}
                                      onClick={(event) => event.stopPropagation()}
                                      onChange={(event) => updateSelectedUnit(unit.id, {
                                        commercialBilling: {
                                          invoiceTerms: selectedUnitDetails.commercialBilling?.invoiceTerms || "",
                                          purchaseOrderReference: selectedUnitDetails.commercialBilling?.purchaseOrderReference,
                                          billingReference: event.target.value,
                                          paymentSchedule: selectedUnitDetails.commercialBilling?.paymentSchedule || "monthly",
                                          paymentScheduleNotes: selectedUnitDetails.commercialBilling?.paymentScheduleNotes,
                                        },
                                      })}
                                      placeholder="Store Ops / AP"
                                      className="mt-1 w-full border border-border/40 bg-background px-2 py-2 text-xs text-foreground"
                                    />
                                  </label>

                                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider md:col-span-2">
                                    Schedule Override Notes
                                    <textarea
                                      value={selectedUnitDetails.commercialBilling?.paymentScheduleNotes || ""}
                                      onClick={(event) => event.stopPropagation()}
                                      onChange={(event) => updateSelectedUnit(unit.id, {
                                        commercialBilling: {
                                          invoiceTerms: selectedUnitDetails.commercialBilling?.invoiceTerms || "",
                                          purchaseOrderReference: selectedUnitDetails.commercialBilling?.purchaseOrderReference,
                                          billingReference: selectedUnitDetails.commercialBilling?.billingReference,
                                          paymentSchedule: selectedUnitDetails.commercialBilling?.paymentSchedule || "monthly",
                                          paymentScheduleNotes: event.target.value,
                                        },
                                      })}
                                      rows={3}
                                      placeholder="Document invoice timing, temporary offline handling, or tenant-specific overrides."
                                      className="mt-1 w-full border border-border/40 bg-background px-2 py-2 text-xs text-foreground"
                                    />
                                  </label>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      )}

      {/* Applications View */}
      {view === "applications" && (
        <SectionCard title="Tenant Applications">
          {units.flatMap((u) =>
            u.applicationDetails?.map((app) => (
              <div key={app.id} className="border border-border/20 rounded-md p-3 mb-2 hover:bg-card/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{app.tenant}</span>
                      <Badge className={getApplicationStatusColor(app.status)}>{app.status}</Badge>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mt-1">{u.unit} • Applied {app.appliedDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium text-accent">${app.proposedRent.toLocaleString()}</p>
                    <p className="text-xs font-mono text-muted-foreground">Move-in {app.moveInDate}</p>
                  </div>
                </div>
              </div>
            )) || []
          )}
        </SectionCard>
      )}

      {/* Renewals View */}
      {view === "renewals" && (
        <SectionCard title="Lease Renewals & Expirations">
          {RENEWALS.length === 0 ? (
            <EmptyState message="No lease renewals scheduled" />
          ) : (
            <div className="space-y-2">
              {RENEWALS.map((renewal) => (
                <div key={renewal.id} className="border border-border/20 rounded-md p-3 hover:bg-card/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{renewal.unit}</span>
                      <Badge
                        className={
                          renewal.daysUntilExpiry <= 30
                            ? "border-red-500/40 text-red-500"
                            : renewal.daysUntilExpiry <= 60
                              ? "border-orange-500/40 text-orange-500"
                              : "border-green-500/40 text-green-500"
                        }
                      >
                        {renewal.daysUntilExpiry} days
                      </Badge>
                    </div>
                    <Badge
                      className={
                        renewal.status === "pending_renewal"
                          ? "border-yellow-500/40 text-yellow-500"
                          : renewal.status === "renewed"
                            ? "border-green-500/40 text-green-500"
                            : "border-gray-500/40 text-gray-500"
                      }
                    >
                      {renewal.status === "pending_renewal" ? "Pending" : renewal.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    <div className="text-[10px] font-mono text-muted-foreground">
                      <span className="uppercase">Tenant</span>
                      <p className="text-foreground mt-0.5">{renewal.currentTenant}</p>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      <span className="uppercase">Current Rent</span>
                      <p className="text-foreground mt-0.5">${renewal.currentRent.toLocaleString()}</p>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      <span className="uppercase">Proposed Rent</span>
                      <p className="text-accent font-medium mt-0.5">${renewal.proposedRent.toLocaleString()}</p>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      <span className="uppercase">Expiry</span>
                      <p className="text-foreground mt-0.5">{renewal.expiryDate}</p>
                    </div>
                  </div>

                  {renewal.proposedRent > renewal.currentRent && (
                    <p className="text-[10px] font-mono text-green-500 mt-2">
                      ↑ Rent increase: ${(renewal.proposedRent - renewal.currentRent).toLocaleString()} ({(((renewal.proposedRent - renewal.currentRent) / renewal.currentRent) * 100).toFixed(1)}%)
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}

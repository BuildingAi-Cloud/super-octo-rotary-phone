import type { User } from "@/lib/auth-context"
import type { BuildingType, CommercialBillingDetails, PaymentCollectionMode, PaymentHistoryEntry, PaymentMethod, TenantLeaseProfile } from "@/lib/tenant-portal-config"

const LEASING_UNITS_KEY = "buildsync_leasing_units"

export type LeaseStatus = "vacant" | "notice_given" | "in_negotiation" | "leased"
export type ApplicationStatus = "pending" | "approved" | "rejected"

export interface LeaseApplication {
  id: string
  tenant: string
  appliedDate: string
  status: ApplicationStatus
  proposedRent: number
  moveInDate: string
}

export interface LeasingUnitRecord {
  id: string
  unit: string
  building: string
  buildingId: string
  buildingType: BuildingType
  floor: number
  sqft: number
  status: LeaseStatus
  listed?: string
  moveOut?: string
  currentTenant?: string
  tenantEmail?: string
  askingRent: number
  currentRent?: number
  applications: number
  applicationDetails?: LeaseApplication[]
  leaseStartDate?: string
  leaseEndDate?: string
  nextPayment?: string
  daysUntilDue?: number
  paymentCollectionMode?: PaymentCollectionMode
  paymentMethods?: PaymentMethod[]
  primaryPaymentMethod?: PaymentMethod
  allowPaymentSetup?: boolean
  paymentHistory?: PaymentHistoryEntry[]
  commercialBilling?: CommercialBillingDetails
  paymentInstructions?: string
  paymentContact?: string
}

export interface SpaceImportResult {
  total: number
  added: number
  updated: number
  skipped: number
  errors: { row: number; email: string; reason: string }[]
}

const DEFAULT_LEASING_UNITS: LeasingUnitRecord[] = [
  {
    id: "u1",
    unit: "Unit 1401",
    building: "Parkview Tower",
    buildingId: "parkview-tower",
    buildingType: "rental_tower",
    floor: 14,
    sqft: 1250,
    status: "vacant",
    listed: "Mar 1",
    askingRent: 3200,
    applications: 4,
    applicationDetails: [
      { id: "a1", tenant: "Alex Chen", appliedDate: "2025-01-10", status: "pending", proposedRent: 3100, moveInDate: "2025-02-15" },
      { id: "a2", tenant: "Emma Rodriguez", appliedDate: "2025-01-08", status: "approved", proposedRent: 3200, moveInDate: "2025-02-01" },
      { id: "a3", tenant: "James Park", appliedDate: "2025-01-12", status: "pending", proposedRent: 3150, moveInDate: "2025-02-20" },
      { id: "a4", tenant: "Sophie Turner", appliedDate: "2025-01-05", status: "rejected", proposedRent: 2900, moveInDate: "2025-02-10" },
    ],
  },
  {
    id: "u2",
    unit: "Unit 807",
    building: "Parkview Tower",
    buildingId: "parkview-tower",
    buildingType: "rental_tower",
    floor: 8,
    sqft: 850,
    status: "leased",
    moveOut: "Apr 15",
    currentTenant: "Tenant",
    tenantEmail: "test_tenant@example.com",
    currentRent: 2400,
    askingRent: 2500,
    applications: 0,
    leaseStartDate: "Jan 1, 2025",
    leaseEndDate: "Dec 31, 2025",
    nextPayment: "Apr 1, 2026",
    daysUntilDue: 14,
    paymentCollectionMode: "portal",
    paymentMethods: ["credit_card", "e_transfer"],
    primaryPaymentMethod: "credit_card",
    allowPaymentSetup: true,
    paymentHistory: [
      { period: "March 2026", amount: 2400, status: "paid", date: "Mar 1", method: "credit_card" },
      { period: "February 2026", amount: 2400, status: "paid", date: "Feb 1", method: "e_transfer" },
      { period: "January 2026", amount: 2400, status: "paid", date: "Jan 1", method: "credit_card" },
    ],
    paymentContact: "Accounts team",
  },
  {
    id: "u3",
    unit: "Unit 302",
    building: "Parkview Tower",
    buildingId: "parkview-tower",
    buildingType: "condo",
    floor: 3,
    sqft: 1100,
    status: "leased",
    currentTenant: "Michael Wong",
    tenantEmail: "michael.wong@example.com",
    currentRent: 2900,
    askingRent: 2900,
    applications: 2,
    leaseStartDate: "Jan 1, 2025",
    leaseEndDate: "Dec 31, 2025",
    nextPayment: "Apr 1, 2026",
    daysUntilDue: 14,
    paymentCollectionMode: "owner_direct",
    paymentMethods: ["e_transfer", "offline"],
    primaryPaymentMethod: "e_transfer",
    allowPaymentSetup: false,
    paymentHistory: [
      { period: "March 2026", amount: 2900, status: "offline", date: "Mar 3", method: "e_transfer", note: "Paid directly to owner" },
      { period: "February 2026", amount: 2900, status: "offline", date: "Feb 2", method: "offline", note: "Owner-arranged settlement" },
    ],
    paymentInstructions: "This condo owner collects rent by e-transfer or offline arrangement. The resident portal should not show direct payment actions.",
    paymentContact: "Owner representative",
    applicationDetails: [
      { id: "a5", tenant: "Michael Wong", appliedDate: "2025-01-11", status: "approved", proposedRent: 2900, moveInDate: "2025-02-05" },
      { id: "a6", tenant: "Rachel Green", appliedDate: "2025-01-13", status: "pending", proposedRent: 2850, moveInDate: "2025-02-25" },
    ],
  },
  {
    id: "u4",
    unit: "Unit 2205",
    building: "Parkview Tower",
    buildingId: "parkview-tower",
    buildingType: "commercial",
    floor: 22,
    sqft: 1800,
    status: "leased",
    currentTenant: "David Kim",
    tenantEmail: "david.kim@example.com",
    currentRent: 4500,
    askingRent: 4500,
    applications: 0,
    leaseStartDate: "Jan 1, 2025",
    leaseEndDate: "Dec 31, 2025",
    nextPayment: "Apr 1, 2026",
    daysUntilDue: 14,
    paymentCollectionMode: "flexible",
    paymentMethods: ["credit_card", "e_transfer", "offline"],
    primaryPaymentMethod: "e_transfer",
    allowPaymentSetup: true,
    paymentHistory: [
      { period: "March 2026", amount: 4500, status: "paid", date: "Mar 5", method: "e_transfer", note: "Invoice INV-2205-03" },
      { period: "February 2026", amount: 4500, status: "paid", date: "Feb 28", method: "offline", note: "Offline settlement approved" },
      { period: "April 2026", amount: 4500, status: "scheduled", date: "Apr 15", method: "credit_card", note: "Card autopay configured" },
    ],
    commercialBilling: {
      invoiceTerms: "Net 15",
      purchaseOrderReference: "PO-2205-OPS",
      billingReference: "Tenant Ops West",
      paymentSchedule: "on_invoice",
      paymentScheduleNotes: "Tenant can switch between card, e-transfer, or offline settlement based on monthly operations.",
    },
    paymentInstructions: "Commercial tenants can configure card billing, use e-transfer, or switch to offline settlement based on day-to-day needs.",
    paymentContact: "Commercial accounts desk",
  },
]

function cloneDefaults(): LeasingUnitRecord[] {
  return DEFAULT_LEASING_UNITS.map((unit) => ({
    ...unit,
    applicationDetails: unit.applicationDetails ? unit.applicationDetails.map((application) => ({ ...application })) : undefined,
    paymentHistory: unit.paymentHistory ? unit.paymentHistory.map((entry) => ({ ...entry })) : undefined,
    commercialBilling: unit.commercialBilling ? { ...unit.commercialBilling } : undefined,
  }))
}

function canUseStorage(): boolean {
  return typeof window !== "undefined"
}

function readUnits(): LeasingUnitRecord[] {
  if (!canUseStorage()) return cloneDefaults()

  const saved = localStorage.getItem(LEASING_UNITS_KEY)
  if (!saved) {
    const seeded = cloneDefaults()
    localStorage.setItem(LEASING_UNITS_KEY, JSON.stringify(seeded))
    return seeded
  }

  try {
    const parsed = JSON.parse(saved) as LeasingUnitRecord[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = cloneDefaults()
      localStorage.setItem(LEASING_UNITS_KEY, JSON.stringify(seeded))
      return seeded
    }
    return parsed
  } catch {
    const seeded = cloneDefaults()
    localStorage.setItem(LEASING_UNITS_KEY, JSON.stringify(seeded))
    return seeded
  }
}

function writeUnits(units: LeasingUnitRecord[]) {
  if (!canUseStorage()) return
  localStorage.setItem(LEASING_UNITS_KEY, JSON.stringify(units))
}

export function listLeasingUnits(): LeasingUnitRecord[] {
  return readUnits()
}

export function updateLeasingUnit(unitId: string, updates: Partial<LeasingUnitRecord>): LeasingUnitRecord[] {
  const next = readUnits().map((unit) => (unit.id === unitId ? { ...unit, ...updates } : unit))
  writeUnits(next)
  return next
}

export function getLeaseProfileForUser(user: User): TenantLeaseProfile | null {
  const matchedUnit = readUnits().find((unit) => {
    if (user.unit && user.unit === unit.unit) return true
    if (user.email && unit.tenantEmail?.toLowerCase() === user.email.toLowerCase()) return true
    if (user.name && unit.currentTenant?.toLowerCase() === user.name.toLowerCase()) return true
    return false
  })

  if (!matchedUnit) return null

  return {
    unit: matchedUnit.unit,
    building: matchedUnit.building,
    buildingId: matchedUnit.buildingId,
    buildingType: matchedUnit.buildingType,
    startDate: matchedUnit.leaseStartDate || "Jan 1, 2025",
    endDate: matchedUnit.leaseEndDate || "Dec 31, 2025",
    monthlyRent: matchedUnit.currentRent || matchedUnit.askingRent,
    status: matchedUnit.status,
    nextPayment: matchedUnit.nextPayment,
    daysUntilDue: matchedUnit.daysUntilDue,
    paymentCollectionMode: matchedUnit.paymentCollectionMode,
    paymentMethods: matchedUnit.paymentMethods,
    primaryPaymentMethod: matchedUnit.primaryPaymentMethod,
    allowPaymentSetup: matchedUnit.allowPaymentSetup,
    paymentHistory: matchedUnit.paymentHistory,
    commercialBilling: matchedUnit.commercialBilling,
    paymentInstructions: matchedUnit.paymentInstructions,
    paymentContact: matchedUnit.paymentContact,
  }
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function toNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * Upsert leasing/commercial spaces from CSV using buildingId+unit as unique key.
 * Required columns: unit, building
 * Optional columns: buildingId, buildingType, floor, sqft, status, askingRent, currentRent,
 * currentTenant, tenantEmail, paymentCollectionMode, paymentContact, paymentInstructions,
 * invoiceTerms, purchaseOrderReference, billingReference, paymentSchedule, paymentScheduleNotes.
 */
export function bulkUpsertLeasingUnitsCsv(csvText: string, actor: User): SpaceImportResult {
  const result: SpaceImportResult = { total: 0, added: 0, updated: 0, skipped: 0, errors: [] }

  if (!["building_manager", "property_manager", "admin", "building_owner"].includes(actor.role)) {
    result.errors.push({ row: 0, email: "", reason: `${actor.role} cannot import leasing spaces` })
    return result
  }

  const lines = csvText.trim().split(/\r?\n/)
  if (lines.length < 2) {
    result.errors.push({ row: 0, email: "", reason: "CSV must have a header row and at least one data row" })
    return result
  }

  const headers = lines[0].toLowerCase().split(",").map((h) => h.trim())
  const unitIdx = headers.indexOf("unit")
  const buildingIdx = headers.indexOf("building")
  const buildingIdIdx = headers.indexOf("buildingid")
  const buildingTypeIdx = headers.indexOf("buildingtype")
  const floorIdx = headers.indexOf("floor")
  const sqftIdx = headers.indexOf("sqft")
  const statusIdx = headers.indexOf("status")
  const askingRentIdx = headers.indexOf("askingrent")
  const currentRentIdx = headers.indexOf("currentrent")
  const tenantIdx = headers.indexOf("currenttenant")
  const tenantEmailIdx = headers.indexOf("tenantemail")
  const paymentModeIdx = headers.indexOf("paymentcollectionmode")
  const paymentContactIdx = headers.indexOf("paymentcontact")
  const paymentInstructionsIdx = headers.indexOf("paymentinstructions")
  const invoiceTermsIdx = headers.indexOf("invoiceterms")
  const poRefIdx = headers.indexOf("purchaseorderreference")
  const billingRefIdx = headers.indexOf("billingreference")
  const scheduleIdx = headers.indexOf("paymentschedule")
  const scheduleNotesIdx = headers.indexOf("paymentschedulenotes")

  if (unitIdx === -1 || buildingIdx === -1) {
    result.errors.push({ row: 0, email: "", reason: "CSV must have 'unit' and 'building' columns" })
    return result
  }

  const units = readUnits()

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim())
    const unit = cols[unitIdx] || ""
    const building = cols[buildingIdx] || ""
    const buildingId = (buildingIdIdx >= 0 ? cols[buildingIdIdx] : "") || slugify(building)

    result.total++

    if (!unit || !building) {
      result.errors.push({ row: i + 1, email: `${building}:${unit}`, reason: "Missing unit or building" })
      result.skipped++
      continue
    }

    const buildingType = ((buildingTypeIdx >= 0 ? cols[buildingTypeIdx] : "") || "commercial") as BuildingType
    const status = ((statusIdx >= 0 ? cols[statusIdx] : "") || "vacant") as LeaseStatus
    const currentRent = toNumber(currentRentIdx >= 0 ? cols[currentRentIdx] : undefined, 0)
    const askingRent = toNumber(askingRentIdx >= 0 ? cols[askingRentIdx] : undefined, currentRent)
    const floor = toNumber(floorIdx >= 0 ? cols[floorIdx] : undefined, 1)
    const sqft = toNumber(sqftIdx >= 0 ? cols[sqftIdx] : undefined, 0)

    const commercialBilling: CommercialBillingDetails | undefined =
      invoiceTermsIdx >= 0 || poRefIdx >= 0 || billingRefIdx >= 0 || scheduleIdx >= 0 || scheduleNotesIdx >= 0
        ? {
            invoiceTerms: (invoiceTermsIdx >= 0 ? cols[invoiceTermsIdx] : "") || "Net 30",
            purchaseOrderReference: poRefIdx >= 0 ? cols[poRefIdx] || undefined : undefined,
            billingReference: billingRefIdx >= 0 ? cols[billingRefIdx] || undefined : undefined,
            paymentSchedule: ((scheduleIdx >= 0 ? cols[scheduleIdx] : "") || "monthly") as CommercialBillingDetails["paymentSchedule"],
            paymentScheduleNotes: scheduleNotesIdx >= 0 ? cols[scheduleNotesIdx] || undefined : undefined,
          }
        : undefined

    const payload: Partial<LeasingUnitRecord> = {
      unit,
      building,
      buildingId,
      buildingType,
      floor,
      sqft,
      status,
      askingRent,
      currentRent: currentRent || undefined,
      currentTenant: tenantIdx >= 0 ? cols[tenantIdx] || undefined : undefined,
      tenantEmail: tenantEmailIdx >= 0 ? cols[tenantEmailIdx] || undefined : undefined,
      paymentCollectionMode: ((paymentModeIdx >= 0 ? cols[paymentModeIdx] : "") || "flexible") as PaymentCollectionMode,
      paymentContact: paymentContactIdx >= 0 ? cols[paymentContactIdx] || undefined : undefined,
      paymentInstructions: paymentInstructionsIdx >= 0 ? cols[paymentInstructionsIdx] || undefined : undefined,
      commercialBilling,
    }

    const existingIndex = units.findIndex((record) => record.unit === unit && record.buildingId === buildingId)
    if (existingIndex === -1) {
      units.push({
        id: crypto.randomUUID(),
        applications: 0,
        ...payload,
      } as LeasingUnitRecord)
      result.added++
      continue
    }

    units[existingIndex] = {
      ...units[existingIndex],
      ...payload,
    }
    result.updated++
  }

  writeUnits(units)
  return result
}
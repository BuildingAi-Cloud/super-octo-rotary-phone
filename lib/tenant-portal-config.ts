export type BuildingType = "rental_tower" | "condo" | "mixed_use" | "commercial" | "student_housing"

export type PaymentCollectionMode = "portal" | "owner_direct" | "flexible"

export type PaymentMethod = "credit_card" | "e_transfer" | "offline"

export type PaymentSchedule = "monthly" | "biweekly" | "on_invoice" | "custom"

export interface PaymentHistoryEntry {
  period: string
  amount: number
  status: "paid" | "scheduled" | "pending" | "offline"
  date: string
  method: PaymentMethod
  note?: string
}

export interface CommercialBillingDetails {
  invoiceTerms: string
  purchaseOrderReference?: string
  billingReference?: string
  paymentSchedule: PaymentSchedule
  paymentScheduleNotes?: string
}

export interface TenantLeaseProfile {
  unit: string
  building: string
  buildingId?: string
  buildingType: BuildingType
  startDate: string
  endDate: string
  monthlyRent: number
  status: string
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

interface PaymentVisibilityConfig {
  showPaymentsTab: boolean
  canMakePortalPayment: boolean
  canManagePaymentSetup: boolean
  paymentCollectionMode: PaymentCollectionMode
  paymentMethods: PaymentMethod[]
  primaryPaymentMethod: PaymentMethod
  paymentInstructions: string
  paymentContact: string
  paymentSummary: string
}

const DEFAULT_BUILDING_PAYMENT_RULES: Record<BuildingType, PaymentVisibilityConfig> = {
  rental_tower: {
    showPaymentsTab: true,
    canMakePortalPayment: true,
    canManagePaymentSetup: true,
    paymentCollectionMode: "portal",
    paymentMethods: ["credit_card", "e_transfer"],
    primaryPaymentMethod: "credit_card",
    paymentInstructions: "Pay rent through the tenant portal by credit card or use the building-approved e-transfer route.",
    paymentContact: "Accounts team",
    paymentSummary: "Portal billing",
  },
  condo: {
    showPaymentsTab: false,
    canMakePortalPayment: false,
    canManagePaymentSetup: false,
    paymentCollectionMode: "owner_direct",
    paymentMethods: ["e_transfer", "offline"],
    primaryPaymentMethod: "e_transfer",
    paymentInstructions: "This unit is billed directly by the owner. Use the lease instructions shared at move-in.",
    paymentContact: "Unit owner",
    paymentSummary: "Owner direct",
  },
  mixed_use: {
    showPaymentsTab: true,
    canMakePortalPayment: true,
    canManagePaymentSetup: true,
    paymentCollectionMode: "flexible",
    paymentMethods: ["credit_card", "e_transfer", "offline"],
    primaryPaymentMethod: "credit_card",
    paymentInstructions: "Mixed-use units can pay through the portal, e-transfer, or approved offline arrangements depending on the lease.",
    paymentContact: "Building operations",
    paymentSummary: "Flexible billing",
  },
  commercial: {
    showPaymentsTab: true,
    canMakePortalPayment: true,
    canManagePaymentSetup: true,
    paymentCollectionMode: "flexible",
    paymentMethods: ["credit_card", "e_transfer", "offline"],
    primaryPaymentMethod: "e_transfer",
    paymentInstructions: "Commercial tenants can configure payment setup in the portal or handle billing offline as business needs change.",
    paymentContact: "Commercial accounts",
    paymentSummary: "Commercial flexible billing",
  },
  student_housing: {
    showPaymentsTab: true,
    canMakePortalPayment: true,
    canManagePaymentSetup: true,
    paymentCollectionMode: "portal",
    paymentMethods: ["credit_card", "e_transfer"],
    primaryPaymentMethod: "e_transfer",
    paymentInstructions: "Housing payments are handled in the resident portal unless your lease states otherwise.",
    paymentContact: "Housing office",
    paymentSummary: "Portal billing",
  },
}

export function resolveTenantPaymentVisibility(profile: TenantLeaseProfile): PaymentVisibilityConfig {
  const defaultRule = DEFAULT_BUILDING_PAYMENT_RULES[profile.buildingType]
  const resolvedCollectionMode = profile.paymentCollectionMode || defaultRule.paymentCollectionMode
  const resolvedMethods = profile.paymentMethods && profile.paymentMethods.length > 0 ? profile.paymentMethods : defaultRule.paymentMethods
  const resolvedPrimaryMethod = profile.primaryPaymentMethod || resolvedMethods[0] || defaultRule.primaryPaymentMethod
  const canManagePaymentSetup = profile.allowPaymentSetup ?? defaultRule.canManagePaymentSetup
  const canMakePortalPayment = resolvedCollectionMode !== "owner_direct" && resolvedMethods.some((method) => method === "credit_card" || method === "e_transfer")
  const showPaymentsTab = resolvedCollectionMode !== "owner_direct" || canManagePaymentSetup
  const summary =
    resolvedCollectionMode === "owner_direct"
      ? "Owner direct"
      : resolvedCollectionMode === "flexible"
        ? "Flexible payment setup"
        : "Portal billing"

  return {
    ...defaultRule,
    paymentCollectionMode: resolvedCollectionMode,
    paymentMethods: resolvedMethods,
    primaryPaymentMethod: resolvedPrimaryMethod,
    canManagePaymentSetup,
    canMakePortalPayment,
    showPaymentsTab,
    paymentInstructions: profile.paymentInstructions || defaultRule.paymentInstructions,
    paymentContact: profile.paymentContact || defaultRule.paymentContact,
    paymentSummary: summary,
  }
}
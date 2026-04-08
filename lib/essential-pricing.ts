export type EssentialCustomerType = "building_owner" | "building_manager" | "facility_manager"

export interface EssentialPlanProfile {
  customerType: EssentialCustomerType
  tenancyName?: string
  buildingCount?: number
  selectedFeatures?: string[]
  siteCount?: number
  estimatedUnits?: number
}

export interface EssentialQuote {
  customerType: EssentialCustomerType
  pricingModel: string
  metricLabel: string
  quantity: number
  monthly: number
  yearly: number
  targetMargin: number
  detail: string
}

export interface EssentialProfitability {
  monthlyCost: number
  monthlyRevenue: number
  monthlyProfit: number
  monthlyMargin: number
  yearlyCost: number
  yearlyRevenue: number
  yearlyProfit: number
  yearlyMargin: number
}

export interface EssentialCostAssumptions {
  buildingOwner: {
    targetMargin: number
    monthlyInfraCost: number
    monthlyOpsCost: number
  }
  buildingManager: {
    targetMargin: number
    monthlyBaseCost: number
    monthlyFeatureCost: number
  }
  facilityManager: {
    targetMargin: number
    monthlyBaseSiteCost: number
    monthlyAdditionalSiteCost: number
  }
}

const YEARLY_DISCOUNT_FACTOR = 0.85
const MIN_MARGIN = 0.4
const MAX_MARGIN = 0.6
export const ESSENTIAL_COST_ASSUMPTIONS_STORAGE_KEY = "buildsync_essential_cost_assumptions"

export const DEFAULT_ESSENTIAL_COST_ASSUMPTIONS: EssentialCostAssumptions = {
  buildingOwner: {
    targetMargin: 0.5,
    monthlyInfraCost: 42,
    monthlyOpsCost: 18,
  },
  buildingManager: {
    targetMargin: 0.55,
    monthlyBaseCost: 34,
    monthlyFeatureCost: 15,
  },
  facilityManager: {
    targetMargin: 0.45,
    monthlyBaseSiteCost: 88,
    monthlyAdditionalSiteCost: 22,
  },
}

function clampMargin(value: number): number {
  return Math.min(MAX_MARGIN, Math.max(MIN_MARGIN, value))
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

function applyMargin(cost: number, margin: number): number {
  // Margin formula: price = cost / (1 - margin)
  const safeMargin = clampMargin(margin)
  return roundCurrency(cost / (1 - safeMargin))
}

function sanitizeCost(value: unknown, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return parsed
}

function toPositiveInt(value: number | string | undefined, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ""), 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return parsed
}

export function parseEssentialCustomerType(value: string | null | undefined): EssentialCustomerType {
  if (value === "building_owner" || value === "building_manager" || value === "facility_manager") {
    return value
  }

  return "building_owner"
}

export function sanitizeEssentialCostAssumptions(
  value: Partial<EssentialCostAssumptions> | null | undefined,
): EssentialCostAssumptions {
  const ownerDefaults = DEFAULT_ESSENTIAL_COST_ASSUMPTIONS.buildingOwner
  const managerDefaults = DEFAULT_ESSENTIAL_COST_ASSUMPTIONS.buildingManager
  const facilityDefaults = DEFAULT_ESSENTIAL_COST_ASSUMPTIONS.facilityManager

  return {
    buildingOwner: {
      targetMargin: clampMargin(Number(value?.buildingOwner?.targetMargin ?? ownerDefaults.targetMargin)),
      monthlyInfraCost: sanitizeCost(value?.buildingOwner?.monthlyInfraCost, ownerDefaults.monthlyInfraCost),
      monthlyOpsCost: sanitizeCost(value?.buildingOwner?.monthlyOpsCost, ownerDefaults.monthlyOpsCost),
    },
    buildingManager: {
      targetMargin: clampMargin(Number(value?.buildingManager?.targetMargin ?? managerDefaults.targetMargin)),
      monthlyBaseCost: sanitizeCost(value?.buildingManager?.monthlyBaseCost, managerDefaults.monthlyBaseCost),
      monthlyFeatureCost: sanitizeCost(value?.buildingManager?.monthlyFeatureCost, managerDefaults.monthlyFeatureCost),
    },
    facilityManager: {
      targetMargin: clampMargin(Number(value?.facilityManager?.targetMargin ?? facilityDefaults.targetMargin)),
      monthlyBaseSiteCost: sanitizeCost(value?.facilityManager?.monthlyBaseSiteCost, facilityDefaults.monthlyBaseSiteCost),
      monthlyAdditionalSiteCost: sanitizeCost(value?.facilityManager?.monthlyAdditionalSiteCost, facilityDefaults.monthlyAdditionalSiteCost),
    },
  }
}

export function getEssentialQuote(
  profile: EssentialPlanProfile,
  assumptions: Partial<EssentialCostAssumptions> | null | undefined = DEFAULT_ESSENTIAL_COST_ASSUMPTIONS,
): EssentialQuote {
  const resolvedAssumptions = sanitizeEssentialCostAssumptions(assumptions)
  const customerType = parseEssentialCustomerType(profile.customerType)

  if (customerType === "building_owner") {
    const buildingCount = toPositiveInt(profile.buildingCount, 1)
    const targetMargin = resolvedAssumptions.buildingOwner.targetMargin
    const monthlyInfraCost = resolvedAssumptions.buildingOwner.monthlyInfraCost
    const monthlyOpsCost = resolvedAssumptions.buildingOwner.monthlyOpsCost
    const costPerBuilding = monthlyInfraCost + monthlyOpsCost
    const monthly = applyMargin(buildingCount * costPerBuilding, targetMargin)
    const yearly = roundCurrency(monthly * 12 * YEARLY_DISCOUNT_FACTOR)

    return {
      customerType,
      pricingModel: "Commercial portfolio subscription (cloud + ops)",
      metricLabel: "Buildings",
      quantity: buildingCount,
      monthly,
      yearly,
      targetMargin,
      detail: `${buildingCount} commercial building${buildingCount === 1 ? "" : "s"}`,
    }
  }

  if (customerType === "building_manager") {
    const featureCount = Math.max(1, profile.selectedFeatures?.length ?? 0)
    const targetMargin = resolvedAssumptions.buildingManager.targetMargin
    const monthlyBaseCost = resolvedAssumptions.buildingManager.monthlyBaseCost
    const monthlyFeatureCost = resolvedAssumptions.buildingManager.monthlyFeatureCost
    const totalCost = monthlyBaseCost + featureCount * monthlyFeatureCost
    const monthly = applyMargin(totalCost, targetMargin)
    const yearly = roundCurrency(monthly * 12 * YEARLY_DISCOUNT_FACTOR)

    return {
      customerType,
      pricingModel: "Feature-based subscription (cloud + support)",
      metricLabel: "Feature bundles",
      quantity: featureCount,
      monthly,
      yearly,
      targetMargin,
      detail: `${featureCount} enabled feature bundle${featureCount === 1 ? "" : "s"}`,
    }
  }

  const siteCount = toPositiveInt(profile.siteCount, 1)
  const targetMargin = resolvedAssumptions.facilityManager.targetMargin
  const monthlyBaseSiteCost = resolvedAssumptions.facilityManager.monthlyBaseSiteCost
  const monthlyAdditionalSiteCost = resolvedAssumptions.facilityManager.monthlyAdditionalSiteCost
  const totalCost = monthlyBaseSiteCost + Math.max(0, siteCount - 1) * monthlyAdditionalSiteCost
  const monthly = applyMargin(totalCost, targetMargin)
  const yearly = roundCurrency(monthly * 12 * YEARLY_DISCOUNT_FACTOR)

  return {
    customerType,
    pricingModel: "Operations subscription workspace (cloud + delivery)",
    metricLabel: "Sites",
    quantity: siteCount,
    monthly,
    yearly,
    targetMargin,
    detail: `${siteCount} managed site${siteCount === 1 ? "" : "s"}`,
  }
}

export function getEssentialProfitability(
  profile: EssentialPlanProfile,
  assumptions: Partial<EssentialCostAssumptions> | null | undefined = DEFAULT_ESSENTIAL_COST_ASSUMPTIONS,
): EssentialProfitability {
  const resolvedAssumptions = sanitizeEssentialCostAssumptions(assumptions)
  const customerType = parseEssentialCustomerType(profile.customerType)
  const quote = getEssentialQuote(profile, resolvedAssumptions)

  let monthlyCost = 0
  if (customerType === "building_owner") {
    const quantity = toPositiveInt(profile.buildingCount, 1)
    monthlyCost = quantity * (resolvedAssumptions.buildingOwner.monthlyInfraCost + resolvedAssumptions.buildingOwner.monthlyOpsCost)
  } else if (customerType === "building_manager") {
    const featureCount = Math.max(1, profile.selectedFeatures?.length ?? 0)
    monthlyCost = resolvedAssumptions.buildingManager.monthlyBaseCost + featureCount * resolvedAssumptions.buildingManager.monthlyFeatureCost
  } else {
    const quantity = toPositiveInt(profile.siteCount, 1)
    monthlyCost =
      resolvedAssumptions.facilityManager.monthlyBaseSiteCost +
      Math.max(0, quantity - 1) * resolvedAssumptions.facilityManager.monthlyAdditionalSiteCost
  }

  const monthlyRevenue = quote.monthly
  const monthlyProfit = roundCurrency(monthlyRevenue - monthlyCost)
  const monthlyMargin = monthlyRevenue > 0 ? monthlyProfit / monthlyRevenue : 0

  const yearlyCost = roundCurrency(monthlyCost * 12)
  const yearlyRevenue = quote.yearly
  const yearlyProfit = roundCurrency(yearlyRevenue - yearlyCost)
  const yearlyMargin = yearlyRevenue > 0 ? yearlyProfit / yearlyRevenue : 0

  return {
    monthlyCost: roundCurrency(monthlyCost),
    monthlyRevenue,
    monthlyProfit,
    monthlyMargin,
    yearlyCost,
    yearlyRevenue,
    yearlyProfit,
    yearlyMargin,
  }
}

export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

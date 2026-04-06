export type StarterPlan = "essential" | "professional"

export const PHASE_ONE_ESSENTIAL_ONLY = true

export const DEFAULT_STARTER_PLAN: StarterPlan = "essential"

export function resolveStarterPlan(value: string | null | undefined): StarterPlan {
  if (PHASE_ONE_ESSENTIAL_ONLY) {
    return "essential"
  }

  return value === "essential" ? "essential" : "professional"
}

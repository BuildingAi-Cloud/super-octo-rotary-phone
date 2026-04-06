"use client";

import { useEffect, useState } from "react";

export type StarterPlan = "essential" | "professional";

export function useStarterPlan(defaultPlan: StarterPlan = "professional"): StarterPlan {
  const [plan, setPlan] = useState<StarterPlan>(defaultPlan);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("buildsync_signup_plan");
      if (!raw) return;

      const parsed = JSON.parse(raw) as { plan?: string };
      if (parsed.plan === "essential" || parsed.plan === "professional") {
        setPlan(parsed.plan);
      }
    } catch {
      // Keep default when stored value is unavailable or malformed.
    }
  }, []);

  return plan;
}

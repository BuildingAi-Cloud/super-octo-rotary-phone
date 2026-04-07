"use client";

import { useEffect, useState } from "react";
import { DEFAULT_STARTER_PLAN, resolveStarterPlan, type StarterPlan } from "@/lib/rollout";

export function useStarterPlan(defaultPlan: StarterPlan = DEFAULT_STARTER_PLAN): StarterPlan {
  const [plan, setPlan] = useState<StarterPlan>(defaultPlan);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("buildsync_signup_plan");
      if (!raw) return;

      const parsed = JSON.parse(raw) as { plan?: string };
      setPlan(resolveStarterPlan(parsed.plan));
    } catch {
      // Keep default when stored value is unavailable or malformed.
    }
  }, []);

  return plan;
}

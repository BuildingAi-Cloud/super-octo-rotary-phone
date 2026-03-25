"use client"


import { useRef, useEffect } from "react"
import Link from "next/link"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { BitmapChevron } from "@/components/bitmap-chevron"

const plans = [
  {
    name: "Essential",
    price: "$2.50",
    period: "/unit/month",
    description: "For small buildings and HOAs",
    features: [
      "Resident portal & mobile app",
      "Amenity booking system",
      "Maintenance request tracking",
      "Community announcements",
      "Package notifications",
      "Email & chat support",
    ],
    highlight: false,
    cta: "Subscribe Now",
  },
  {
    name: "Professional",
    price: "$4.50",
    period: "/unit/month",
    description: "For property management companies",
    features: [
      "Everything in Essential",
      "AI package tracking (ImageR)",
      "Visitor & contractor management",
      "Digital shift logs",
      "SMS & voice broadcasting",
      "Accounting integrations",
      "Aware IoT sensor support",
      "Priority support",
    ],
    highlight: true,
    cta: "Subscribe Now",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale portfolios",
    features: [
      "Everything in Professional",
      "KeyLink biometric key management",
      "E-voting & governance tools",
      "Custom API integrations",
      "Dedicated account manager",
      "24/7 phone support",
      "On-premise deployment option",
      "Tailored onboarding & training",
    ],
    highlight: false,
    cta: "Contact Sales",
  },
]

// Collect all unique features for table rows
const allFeatures = Array.from(
  new Set(
    plans.flatMap((plan) => plan.features.map((f) => f.replace(/^Everything in .*/, "All previous features")))
  )
)

export function PricingSection() {
  return (
    <section className="py-16 bg-background/80">
      <div className="mb-10 text-3xl md:text-4xl font-extrabold text-center tracking-tight">Pricing Plans</div>
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col rounded-2xl shadow-lg border border-border bg-white/90 dark:bg-background/90 px-6 py-8 w-full md:w-1/3 transition-transform duration-200 hover:scale-105 ${
              plan.highlight ? "border-accent ring-2 ring-accent/40 bg-accent/5" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold uppercase tracking-widest text-accent-foreground">{plan.name}</span>
              {plan.highlight && (
                <span className="px-2 py-1 text-xs font-semibold rounded bg-accent text-accent-foreground">Most Popular</span>
              )}
            </div>
            <div className="text-3xl font-extrabold text-primary mb-1">{plan.price}
              {plan.period && <span className="text-base font-medium text-muted-foreground">{plan.period}</span>}
            </div>
            <div className="mb-4 text-sm text-muted-foreground min-h-[40px]">{plan.description}</div>
            <ul className="flex-1 mb-6 space-y-2">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="inline-block w-4 h-4 text-green-500">✔️</span>
                  <span>{f.replace(/^Everything in .*/, "All previous features")}</span>
                </li>
              ))}
            </ul>
            <Link
              href={plan.cta === "Contact Sales" ? "/contact" : "/signup"}
              className={`mt-auto inline-block text-center rounded-lg px-5 py-2 font-semibold transition-colors duration-200 shadow-sm ${
                plan.highlight
                  ? "bg-accent text-accent-foreground hover:bg-accent/80"
                  : "bg-primary/90 text-white hover:bg-primary"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center text-xs text-muted-foreground">All prices are in USD. Contact us for enterprise or custom needs.</div>
    </section>
  );
}


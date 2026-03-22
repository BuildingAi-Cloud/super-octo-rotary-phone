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
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(headerRef.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {

          return (
            <section id="pricing" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
              {/* Section header */}
              <div className="mb-16">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">05 / Pricing</span>
                <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">CHOOSE YOUR PLAN</h2>
                <p className="mt-4 max-w-lg font-mono text-sm text-muted-foreground leading-relaxed">
                  All plans are paid. No free trials. Scalable pricing for facilities of all sizes. All plans include core security features and compliance tools.
                </p>
              </div>

              {/* Pricing comparison table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-border/40 bg-card/30 rounded-lg">
                  <thead>
                    <tr>
                      <th className="text-left font-mono text-xs uppercase tracking-widest p-4 bg-background/80">Features</th>
                      {plans.map((plan, idx) => (
                        <th key={plan.name} className={`text-center p-4 font-[var(--font-bebas)] text-2xl tracking-wide ${plan.highlight ? "bg-accent/10" : ""}`}>
                          <div>{plan.name}</div>
                          <div className="font-mono text-xs text-muted-foreground mt-1">{plan.description}</div>
                          <div className="mt-2 font-[var(--font-bebas)] text-3xl">{plan.price} <span className="font-mono text-xs text-muted-foreground">{plan.period}</span></div>
                          <Link
                            href={plan.name === "Enterprise" ? "mailto:sales@buildsync.com" : `/checkout?plan=${plan.name.toLowerCase()}`}
                            className={`mt-3 group inline-flex items-center justify-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all duration-200 ${
                              plan.highlight
                                ? "bg-accent text-accent-foreground hover:bg-accent/90"
                                : "border border-foreground/20 text-foreground hover:border-accent hover:text-accent"
                            }`}
                          >
                            <ScrambleTextOnHover text={plan.cta} as="span" duration={0.5} />
                            <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:translate-x-1" />
                          </Link>
                          {plan.highlight && (
                            <div className="mt-2">
                              <span className="bg-accent text-accent-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-widest rounded">Most Popular</span>
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allFeatures.map((feature, rowIdx) => (
                      <tr key={feature} className="border-t border-border/20">
                        <td className="p-4 font-mono text-xs text-foreground/80 w-56 min-w-[180px]">{feature}</td>
                        {plans.map((plan, colIdx) => (
                          <td key={plan.name} className="text-center p-4">
                            {plan.features.some(f => f === feature || (feature === "All previous features" && f.startsWith("Everything in ")))
                              ? <span className="inline-block w-5 h-5 text-accent">✔️</span>
                              : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            <div className="mb-8">
              <span className="font-[var(--font-bebas)] text-5xl tracking-tight">{plan.price}</span>
              <span className="font-mono text-sm text-muted-foreground">{plan.period}</span>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 bg-accent flex-shrink-0" />
                  <span className="font-mono text-xs text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.name === "Enterprise" ? "mailto:sales@buildsync.com" : `/checkout?plan=${plan.name.toLowerCase()}`}
              className={`group inline-flex items-center justify-center gap-3 px-6 py-3 font-mono text-xs uppercase tracking-widest transition-all duration-200 ${
                plan.highlight
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "border border-foreground/20 text-foreground hover:border-accent hover:text-accent"
              }`}
            >
              <ScrambleTextOnHover text={plan.cta} as="span" duration={0.5} />
              <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:translate-x-1" />
            </Link>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-border/20 pt-16">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-accent" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Paid plans only</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-accent" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">No free trial</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-accent" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Cancel anytime</span>
        </div>
      </div>
    </section>
  )
}

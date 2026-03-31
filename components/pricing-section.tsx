"use client"


import Link from "next/link"

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

export function PricingSection() {
  return (
    <section className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12 max-w-[2400px] mx-auto w-full">
      {/* Section header styled like PrinciplesSection */}
      <div className="mb-24">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">05 / Pricing</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">PRICING PLANS</h2>
        <div className="mt-2 text-base text-muted-foreground max-w-2xl">
          Flexible plans for every building size and need. Choose what fits your community best.
        </div>
      </div>

      {/* Pricing cards styled as split articles, similar to PrinciplesSection */}
      <div className="space-y-24 md:space-y-0 md:grid md:grid-cols-3 md:gap-12">
        {plans.map((plan, idx) => (
          <article
            key={plan.name}
            className={`flex flex-col items-start text-left rounded-2xl shadow-lg border border-border bg-white/90 dark:bg-background/90 px-8 py-10 transition-transform duration-200 hover:scale-105 ${
              plan.highlight ? "border-accent ring-2 ring-accent/40 bg-accent/5" : ""
            }`}
          >
            {/* Annotation label */}
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
              {`PLAN ${idx + 1}`}
            </span>
            <h3 className="font-[var(--font-bebas)] text-4xl md:text-6xl lg:text-7xl tracking-tight leading-none mb-2">
              {plan.name}
            </h3>
            <div className="text-4xl font-extrabold text-primary mb-1">
              {plan.price}
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
            {/* Decorative line for visual separation */}
            <div className="mt-8 h-[1px] bg-border w-24 md:w-48" />
          </article>
        ))}
      </div>
      <div className="mt-8 text-center text-xs text-muted-foreground">All prices are in USD. Contact us for enterprise or custom needs.</div>
    </section>
  );
}


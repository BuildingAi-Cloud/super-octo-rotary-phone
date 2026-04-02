"use client"

import Link from "next/link"
import { motion } from "framer-motion"

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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <section className="relative py-16 md:py-28 max-w-screen-xl mx-auto px-3 md:px-6">
      {/* Section header with animation */}
      <motion.div
        className="max-w-7xl mx-auto mb-12 md:mb-20"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">05 / Pricing</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-4xl md:text-6xl lg:text-7xl tracking-tight">PRICING PLANS</h2>
        <div className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Flexible plans for every building size and need. Choose what fits your community best.
        </div>
      </motion.div>

      {/* Pricing cards with staggered animations */}
      <motion.div
        className="max-w-7xl mx-auto space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {plans.map((plan, idx) => (
          <motion.article
            key={plan.name}
            variants={itemVariants}
            className={`flex flex-col items-start text-left rounded-xl shadow-lg border border-border bg-white/90 dark:bg-background/90 px-5 md:px-6 py-6 md:py-8 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              plan.highlight ? "border-accent ring-2 ring-accent/40 bg-accent/5" : ""
            }`}
          >
            {/* Plan label */}
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
              {`PLAN ${idx + 1}`}
            </span>
            
            {/* Plan name with better text wrapping */}
            <h3 className="font-[var(--font-bebas)] text-3xl md:text-5xl lg:text-6xl tracking-tight leading-tight mb-2 break-words w-full">
              {plan.name}
            </h3>
            
            {/* Price and period */}
            <div className="mb-2 w-full">
              <span className="text-3xl md:text-4xl font-extrabold text-primary">{plan.price}</span>
              {plan.period && (
                <span className="text-xs md:text-sm font-medium text-muted-foreground ml-1">{plan.period}</span>
              )}
            </div>
            
            {/* Plan description */}
            <p className="mb-4 text-xs md:text-sm text-muted-foreground leading-relaxed min-h-[30px]">
              {plan.description}
            </p>
            
            {/* Features list with stagger animation */}
            <motion.ul
              className="flex-1 mb-6 space-y-2 w-full"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                },
              }}
            >
              {plan.features.map((f, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-2 text-xs md:text-sm leading-snug"
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                  }}
                >
                  <span className="inline-block w-3.5 h-3.5 flex-shrink-0 text-green-500 mt-0.5">✔️</span>
                  <span className="text-foreground/90">{f.replace(/^Everything in .*/, "All previous features")}</span>
                </motion.li>
              ))}
            </motion.ul>
            
            {/* CTA Button with inverse hover - text becomes background, background becomes text */}
            <Link
              href={plan.cta === "Contact Sales" ? "/contact" : "/signup"}
              className={`w-full text-center rounded-lg px-4 py-2.5 md:py-3 font-semibold text-xs md:text-sm uppercase tracking-wide transition-all duration-300 shadow-sm overflow-hidden relative group ${
                plan.highlight
                  ? "bg-accent text-accent-foreground hover:bg-accent-foreground hover:text-accent"
                  : "bg-foreground text-background border border-foreground/70 hover:bg-background hover:text-foreground"
              }`}
            >
              {plan.cta}
            </Link>
          </motion.article>
        ))}
      </motion.div>
      
      {/* Disclaimer with fade-in */}
      <motion.div
        className="mt-8 md:mt-12 text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        All prices are in USD. Contact us for enterprise or custom needs.
      </motion.div>
    </section>
  );
}

